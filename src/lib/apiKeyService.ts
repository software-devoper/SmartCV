import { auth } from './firebase';
import { AIProvider, UserApiKeyMetadata } from '../types';

const LOCAL_KEY_STORAGE_PREFIX = 'smartcv_byok_';
const LOCAL_DEFAULT_PROVIDER_KEY = 'smartcv_byok_default_provider';

export function getLocalApiKey(provider: AIProvider): string {
  try {
    return localStorage.getItem(`${LOCAL_KEY_STORAGE_PREFIX}${provider}`) || '';
  } catch {
    return '';
  }
}

export function setLocalApiKey(provider: AIProvider, key: string): void {
  try {
    if (key) {
      localStorage.setItem(`${LOCAL_KEY_STORAGE_PREFIX}${provider}`, key);
    } else {
      localStorage.removeItem(`${LOCAL_KEY_STORAGE_PREFIX}${provider}`);
    }
  } catch {}
}

export function getLocalDefaultProvider(): AIProvider {
  try {
    return (localStorage.getItem(LOCAL_DEFAULT_PROVIDER_KEY) as AIProvider) || 'gemini';
  } catch {
    return 'gemini';
  }
}

export function setLocalDefaultProvider(provider: AIProvider): void {
  try {
    localStorage.setItem(LOCAL_DEFAULT_PROVIDER_KEY, provider);
  } catch {}
}

export async function getAuthHeaders(targetProvider?: AIProvider): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const user = auth.currentUser;
  if (user) {
    headers['x-user-id'] = user.uid;
    try {
      const idToken = await user.getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (e) {
      console.warn('Could not retrieve idToken:', e);
    }
  } else {
    // Generate or use guest persistent id
    let guestId = '';
    try {
      guestId = localStorage.getItem('smartcv_guest_uid') || '';
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 12);
        localStorage.setItem('smartcv_guest_uid', guestId);
      }
      headers['x-user-id'] = guestId;
    } catch {}
  }

  const prov = targetProvider || getLocalDefaultProvider();
  const directKey = getLocalApiKey(prov);
  if (directKey) {
    headers['x-api-key'] = directKey;
  }

  return headers;
}

/**
 * Validates an API key against the provider via backend test call without saving.
 */
export async function validateApiKeyClient(
  provider: AIProvider,
  rawKey: string
): Promise<{ valid: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/keys/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, rawKey: rawKey.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { valid: false, error: data.error || 'Validation failed' };
    }
    return { valid: true, message: data.message };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Validation request failed' };
  }
}

/**
 * Validates, encrypts, and saves an API key for the current user.
 */
export async function saveApiKeyClient(
  provider: AIProvider,
  rawKey: string,
  isDefault: boolean = false
): Promise<{ success: boolean; metadata?: UserApiKeyMetadata; message?: string; error?: string }> {
  const cleanKey = rawKey.trim();

  // Validate first
  const validation = await validateApiKeyClient(provider, cleanKey);
  if (!validation.valid) {
    return { success: false, error: validation.error || 'Invalid API key' };
  }

  // Always keep local backup for instant client use
  setLocalApiKey(provider, cleanKey);
  if (isDefault) {
    setLocalDefaultProvider(provider);
  }

  try {
    const headers = await getAuthHeaders(provider);
    const res = await fetch('/api/keys/save', {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider, rawKey: cleanKey, isDefault }),
    });

    const data = await res.json();
    if (!res.ok) {
      // If server save failed due to auth or network, the key is still cached locally
      return {
        success: true,
        message: `${provider.toUpperCase()} key is valid and ready for this session!`,
        metadata: {
          provider,
          maskedKey: cleanKey.slice(0, 4) + '••••••••' + cleanKey.slice(-4),
          isDefault,
          isValid: true,
          lastValidatedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };
    }
    return { success: true, metadata: data.metadata, message: data.message };
  } catch (err: any) {
    return {
      success: true,
      message: `${provider.toUpperCase()} key saved for this session.`,
      metadata: {
        provider,
        maskedKey: cleanKey.slice(0, 4) + '••••••••' + cleanKey.slice(-4),
        isDefault,
        isValid: true,
        lastValidatedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };
  }
}

/**
 * Retrieves all configured API key metadata for the current user.
 */
export async function listUserApiKeysClient(): Promise<UserApiKeyMetadata[]> {
  const localKeys: UserApiKeyMetadata[] = [];
  const providers: AIProvider[] = ['gemini', 'claude', 'openai'];
  const defProv = getLocalDefaultProvider();

  providers.forEach((p) => {
    const k = getLocalApiKey(p);
    if (k) {
      localKeys.push({
        provider: p,
        maskedKey: k.slice(0, 4) + '••••••••' + k.slice(-4),
        isDefault: p === defProv,
        isValid: true,
        lastValidatedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  });

  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/keys/list', {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      return localKeys;
    }

    const data = await res.json();
    const serverKeys: UserApiKeyMetadata[] = data.keys || [];

    // Merge server keys with any local keys
    if (serverKeys.length > 0) {
      return serverKeys;
    }
    return localKeys;
  } catch (err) {
    return localKeys;
  }
}

/**
 * Removes a provider API key for the current user.
 */
export async function removeApiKeyClient(
  provider: AIProvider
): Promise<{ success: boolean; newDefaultProvider?: AIProvider | null; error?: string }> {
  setLocalApiKey(provider, '');

  try {
    const headers = await getAuthHeaders(provider);
    const res = await fetch('/api/keys/remove', {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider }),
    });

    const data = await res.json();
    return { success: true, newDefaultProvider: data.newDefaultProvider };
  } catch (err: any) {
    return { success: true, newDefaultProvider: null };
  }
}

/**
 * Sets a specific provider as default for the current user.
 */
export async function setDefaultApiKeyClient(
  provider: AIProvider
): Promise<{ success: boolean; error?: string }> {
  setLocalDefaultProvider(provider);

  try {
    const headers = await getAuthHeaders(provider);
    const res = await fetch('/api/keys/set-default', {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider }),
    });

    const data = await res.json();
    return { success: true };
  } catch (err: any) {
    return { success: true };
  }
}

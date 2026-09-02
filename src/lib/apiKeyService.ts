import { auth } from './firebase';
import { AIProvider, UserApiKeyMetadata } from '../types';

async function getAuthHeaders(): Promise<Record<string, string>> {
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
      body: JSON.stringify({ provider, rawKey }),
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
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/keys/save', {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider, rawKey, isDefault }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to save API key' };
    }
    return { success: true, metadata: data.metadata, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to communicate with server' };
  }
}

/**
 * Retrieves all configured API key metadata for the current user.
 */
export async function listUserApiKeysClient(): Promise<UserApiKeyMetadata[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/keys/list', {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.keys || [];
  } catch (err) {
    console.error('Failed to load user API keys:', err);
    return [];
  }
}

/**
 * Removes a provider API key for the current user.
 */
export async function removeApiKeyClient(
  provider: AIProvider
): Promise<{ success: boolean; newDefaultProvider?: AIProvider | null; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/keys/remove', {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to remove API key' };
    }
    return { success: true, newDefaultProvider: data.newDefaultProvider };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error removing key' };
  }
}

/**
 * Sets a specific provider as default for the current user.
 */
export async function setDefaultApiKeyClient(
  provider: AIProvider
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/keys/set-default', {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to set default provider' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error setting default' };
  }
}

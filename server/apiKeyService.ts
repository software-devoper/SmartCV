import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import rawConfig from '../firebase-applet-config.json';
import { AIProvider, UserApiKeyMetadata } from '../src/types';
import { encryptApiKey, decryptApiKey, maskApiKey } from './crypto';
import { validateProviderApiKey } from './aiProviders/aiProviderRouter';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    initializeApp({
      projectId: rawConfig.projectId || process.env.VITE_FIREBASE_PROJECT_ID || 'smart-cv-app',
    });
  } catch (e) {
    console.warn('Firebase Admin initialized with default credentials/project');
  }
}

const db = getFirestore();

/**
 * Validates and saves an encrypted AI API key for a user.
 */
export async function saveUserApiKey(
  userId: string,
  provider: AIProvider,
  rawKey: string,
  setAsDefault: boolean = false
): Promise<{ success: boolean; metadata: UserApiKeyMetadata; message: string }> {
  if (!userId) {
    throw new Error('User ID is required to save API key');
  }
  if (!rawKey || !rawKey.trim()) {
    throw new Error('API key cannot be empty');
  }

  const cleanKey = rawKey.trim();

  // 1. Validate key with provider before saving
  const validation = await validateProviderApiKey(provider, cleanKey);
  if (!validation.valid) {
    throw new Error(validation.error || `Validation failed for ${provider} API key`);
  }

  // 2. Encrypt key with AES-256-GCM
  const encryptedKey = encryptApiKey(cleanKey);
  const maskedKey = maskApiKey(cleanKey, provider);

  // 3. Check existing keys for this user to set default appropriately
  const keysColRef = db.collection('users').doc(userId).collection('apiKeys');
  const existingDocs = await keysColRef.get();

  const isFirstKey = existingDocs.empty;
  const shouldBeDefault = setAsDefault || isFirstKey;

  // If this key should be default, unmark other keys
  if (shouldBeDefault && !existingDocs.empty) {
    const batch = db.batch();
    existingDocs.forEach((docSnap) => {
      if (docSnap.id !== provider && docSnap.data().isDefault) {
        batch.update(docSnap.ref, { isDefault: false, updatedAt: Date.now() });
      }
    });
    await batch.commit();
  }

  const docRef = keysColRef.doc(provider);
  const existingDoc = await docRef.get();
  const now = Date.now();

  const docData = {
    provider,
    encryptedKey,
    maskedKey,
    isDefault: shouldBeDefault || (existingDoc.exists ? existingDoc.data()?.isDefault : false),
    isValid: true,
    lastValidatedAt: now,
    createdAt: existingDoc.exists ? existingDoc.data()?.createdAt || now : now,
    updatedAt: now,
  };

  await docRef.set(docData, { merge: true });

  const metadata: UserApiKeyMetadata = {
    provider,
    maskedKey,
    isDefault: docData.isDefault,
    isValid: true,
    lastValidatedAt: now,
    createdAt: docData.createdAt,
    updatedAt: now,
  };

  return {
    success: true,
    metadata,
    message: `${provider.toUpperCase()} API key validated and saved securely.`,
  };
}

/**
 * Retrieves all configured API key metadata for a user (WITHOUT ciphertext or plaintext).
 */
export async function getUserApiKeyMetadataList(
  userId: string
): Promise<UserApiKeyMetadata[]> {
  if (!userId) return [];

  const keysColRef = db.collection('users').doc(userId).collection('apiKeys');
  const snapshot = await keysColRef.get();

  if (snapshot.empty) {
    return [];
  }

  const list: UserApiKeyMetadata[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    list.push({
      provider: docSnap.id as AIProvider,
      maskedKey: data.maskedKey || '••••••••',
      isDefault: Boolean(data.isDefault),
      isValid: data.isValid !== false,
      lastValidatedAt: data.lastValidatedAt,
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    });
  });

  return list;
}

/**
 * Removes an API key for a user and reassigns default if necessary.
 */
export async function removeUserApiKey(
  userId: string,
  provider: AIProvider
): Promise<{ success: boolean; newDefaultProvider?: AIProvider | null }> {
  if (!userId) throw new Error('User ID required');

  const keysColRef = db.collection('users').doc(userId).collection('apiKeys');
  const targetDoc = await keysColRef.doc(provider).get();

  if (!targetDoc.exists) {
    return { success: true, newDefaultProvider: null };
  }

  const wasDefault = Boolean(targetDoc.data()?.isDefault);
  await keysColRef.doc(provider).delete();

  let newDefault: AIProvider | null = null;

  // If deleted key was default, reassign default to first remaining key
  if (wasDefault) {
    const remaining = await keysColRef.get();
    if (!remaining.empty) {
      const firstDoc = remaining.docs[0];
      await firstDoc.ref.update({ isDefault: true, updatedAt: Date.now() });
      newDefault = firstDoc.id as AIProvider;
    }
  }

  return { success: true, newDefaultProvider: newDefault };
}

/**
 * Sets a specific provider as the default for the user.
 */
export async function setDefaultUserApiKey(
  userId: string,
  provider: AIProvider
): Promise<{ success: boolean }> {
  if (!userId) throw new Error('User ID required');

  const keysColRef = db.collection('users').doc(userId).collection('apiKeys');
  const snapshot = await keysColRef.get();

  if (snapshot.empty) {
    throw new Error('No API keys configured for this user');
  }

  const targetDoc = snapshot.docs.find((d) => d.id === provider);
  if (!targetDoc) {
    throw new Error(`No API key found for provider ${provider}`);
  }

  const batch = db.batch();
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      isDefault: docSnap.id === provider,
      updatedAt: Date.now(),
    });
  });

  await batch.commit();
  return { success: true };
}

/**
 * Retrieves and decrypts the user's active API key for server execution.
 */
export async function getUserDecryptedKey(
  userId?: string,
  preferredProvider?: AIProvider,
  directApiKey?: string
): Promise<{ provider: AIProvider; decryptedKey: string }> {
  // If a direct key was provided (e.g. guest mode or local storage fallback)
  if (directApiKey && directApiKey.trim()) {
    return {
      provider: preferredProvider || 'gemini',
      decryptedKey: directApiKey.trim(),
    };
  }

  if (!userId) {
    const err = new Error('Please sign in or enter an AI API key to use AI resume generation.');
    (err as any).code = 'no_key_configured';
    throw err;
  }

  const keysColRef = db.collection('users').doc(userId).collection('apiKeys');
  const snapshot = await keysColRef.get();

  if (snapshot.empty) {
    const err = new Error(
      'To use AI resume generation, please add your own AI API key (Google Gemini, Anthropic Claude, or OpenAI).'
    );
    (err as any).code = 'no_key_configured';
    throw err;
  }

  // Find targeted doc or default doc
  let selectedDoc = preferredProvider
    ? snapshot.docs.find((d) => d.id === preferredProvider)
    : undefined;

  if (!selectedDoc) {
    selectedDoc = snapshot.docs.find((d) => d.data().isDefault) || snapshot.docs[0];
  }

  const data = selectedDoc.data();
  if (!data.encryptedKey) {
    const err = new Error(`Stored key for ${selectedDoc.id} is invalid or corrupt.`);
    (err as any).code = 'invalid_api_key';
    (err as any).provider = selectedDoc.id;
    throw err;
  }

  try {
    const decrypted = decryptApiKey(data.encryptedKey);
    return {
      provider: selectedDoc.id as AIProvider,
      decryptedKey: decrypted,
    };
  } catch (err: any) {
    console.error('Decryption error for user key:', err);
    const error = new Error('Failed to decrypt stored API key. Please re-enter your key in Settings.');
    (error as any).code = 'invalid_api_key';
    (error as any).provider = selectedDoc.id;
    throw error;
  }
}

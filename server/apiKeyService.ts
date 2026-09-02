import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import rawConfig from '../firebase-applet-config.json';
import { AIProvider, UserApiKeyMetadata } from '../src/types';
import { encryptApiKey, decryptApiKey, maskApiKey } from './crypto';
import { validateProviderApiKey } from './aiProviders/aiProviderRouter';

// Safely initialize Firebase Admin if not already initialized
let db: FirebaseFirestore.Firestore | null = null;
try {
  if (getApps().length === 0) {
    initializeApp({
      projectId: rawConfig.projectId || process.env.VITE_FIREBASE_PROJECT_ID || 'smart-cv-app',
    });
  }
  db = getFirestore();
} catch (e) {
  console.warn('Firebase Admin Firestore not initialized with credentials:', e);
}

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
  const now = Date.now();

  const metadata: UserApiKeyMetadata = {
    provider,
    maskedKey,
    isDefault: Boolean(setAsDefault),
    isValid: true,
    lastValidatedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  // 3. Persist to Firestore if available
  if (db) {
    try {
      const keysColRef = db.collection('users').doc(userId).collection('apiKeys');
      const existingDocs = await keysColRef.get();

      const isFirstKey = existingDocs.empty;
      const shouldBeDefault = setAsDefault || isFirstKey;

      if (shouldBeDefault && !existingDocs.empty) {
        const batch = db.batch();
        existingDocs.forEach((docSnap) => {
          if (docSnap.id !== provider && docSnap.data().isDefault) {
            batch.update(docSnap.ref, { isDefault: false, updatedAt: now });
          }
        });
        await batch.commit();
      }

      const docRef = keysColRef.doc(provider);
      const existingDoc = await docRef.get();

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
      metadata.isDefault = docData.isDefault;
      metadata.createdAt = docData.createdAt;
    } catch (err) {
      console.warn('Firestore persistence notice (client session active):', err);
    }
  }

  return {
    success: true,
    metadata,
    message: `${provider.toUpperCase()} API key validated and activated securely.`,
  };
}

/**
 * Retrieves all configured API key metadata for a user (WITHOUT ciphertext or plaintext).
 */
export async function getUserApiKeyMetadataList(
  userId: string
): Promise<UserApiKeyMetadata[]> {
  if (!userId || !db) return [];

  try {
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
  } catch (err) {
    console.warn('Firestore key list lookup unavailable:', err);
    return [];
  }
}

/**
 * Removes an API key for a user and reassigns default if necessary.
 */
export async function removeUserApiKey(
  userId: string,
  provider: AIProvider
): Promise<{ success: boolean; newDefaultProvider?: AIProvider | null }> {
  if (!userId) throw new Error('User ID required');
  if (!db) return { success: true, newDefaultProvider: null };

  try {
    const keysColRef = db.collection('users').doc(userId).collection('apiKeys');
    const targetDoc = await keysColRef.doc(provider).get();

    if (!targetDoc.exists) {
      return { success: true, newDefaultProvider: null };
    }

    const wasDefault = Boolean(targetDoc.data()?.isDefault);
    await keysColRef.doc(provider).delete();

    let newDefault: AIProvider | null = null;

    if (wasDefault) {
      const remaining = await keysColRef.get();
      if (!remaining.empty) {
        const firstDoc = remaining.docs[0];
        await firstDoc.ref.update({ isDefault: true, updatedAt: Date.now() });
        newDefault = firstDoc.id as AIProvider;
      }
    }

    return { success: true, newDefaultProvider: newDefault };
  } catch (err) {
    console.warn('Firestore remove key error:', err);
    return { success: true, newDefaultProvider: null };
  }
}

/**
 * Sets a specific provider as the default for the user.
 */
export async function setDefaultUserApiKey(
  userId: string,
  provider: AIProvider
): Promise<{ success: boolean }> {
  if (!userId) throw new Error('User ID required');
  if (!db) return { success: true };

  try {
    const keysColRef = db.collection('users').doc(userId).collection('apiKeys');
    const snapshot = await keysColRef.get();

    if (snapshot.empty) {
      return { success: true };
    }

    const targetDoc = snapshot.docs.find((d) => d.id === provider);
    if (!targetDoc) {
      return { success: true };
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
  } catch (err) {
    console.warn('Firestore set default key error:', err);
    return { success: true };
  }
}

/**
 * Retrieves and decrypts the user's active API key for server execution.
 */
export async function getUserDecryptedKey(
  userId?: string,
  preferredProvider?: AIProvider,
  directApiKey?: string
): Promise<{ provider: AIProvider; decryptedKey: string }> {
  // If a direct key was provided (e.g. from local storage, guest session, or header)
  if (directApiKey && directApiKey.trim()) {
    return {
      provider: preferredProvider || 'gemini',
      decryptedKey: directApiKey.trim(),
    };
  }

  // Check if environment has a default server key configured
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && (!preferredProvider || preferredProvider === 'gemini')) {
    return {
      provider: 'gemini',
      decryptedKey: envKey.trim(),
    };
  }

  if (!userId) {
    const err = new Error('Please enter your AI API key in Settings to use AI features.');
    (err as any).code = 'no_key_configured';
    throw err;
  }

  if (!db) {
    const err = new Error('Please enter your AI API key in Settings to use AI features.');
    (err as any).code = 'no_key_configured';
    throw err;
  }

  try {
    const keysColRef = db.collection('users').doc(userId).collection('apiKeys');
    const snapshot = await keysColRef.get();

    if (snapshot.empty) {
      const err = new Error('Please enter your AI API key in Settings to use AI features.');
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
      const err = new Error(`Stored key for ${selectedDoc.id} is invalid. Please re-enter your key.`);
      (err as any).code = 'no_key_configured';
      (err as any).provider = selectedDoc.id;
      throw err;
    }

    const decrypted = decryptApiKey(data.encryptedKey);
    return {
      provider: selectedDoc.id as AIProvider,
      decryptedKey: decrypted,
    };
  } catch (err: any) {
    if (err.code === 'no_key_configured') {
      throw err;
    }
    console.warn('Firestore key lookup unavailable:', err?.message);
    const noKeyErr = new Error('Please enter your AI API key in Settings to use AI features.');
    (noKeyErr as any).code = 'no_key_configured';
    throw noKeyErr;
  }
}

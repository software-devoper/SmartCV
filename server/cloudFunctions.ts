import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { AIProvider } from '../src/types';
import {
  saveUserApiKey,
  getUserApiKeyMetadataList,
  removeUserApiKey,
  setDefaultUserApiKey,
} from './apiKeyService';
import { validateProviderApiKey } from './aiProviders/aiProviderRouter';

if (getApps().length === 0) {
  initializeApp();
}

/**
 * Cloud Function: Validate an API key without saving.
 */
export const validateApiKey = onCall(async (request: CallableRequest<any>) => {
  const { provider, rawKey } = request.data || {};
  if (!provider || !rawKey) {
    throw new HttpsError('invalid-argument', 'Both provider and rawKey parameters are required.');
  }

  const result = await validateProviderApiKey(provider as AIProvider, rawKey);
  if (!result.valid) {
    throw new HttpsError('failed-precondition', result.error || 'Invalid API key');
  }

  return { valid: true, message: 'API key is valid.' };
});

/**
 * Cloud Function: Encrypt and save a user's API key.
 */
export const saveApiKey = onCall(async (request: CallableRequest<any>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be signed in.');
  }

  const { provider, rawKey, isDefault } = request.data || {};
  if (!provider || !rawKey) {
    throw new HttpsError('invalid-argument', 'Both provider and rawKey are required.');
  }

  try {
    const result = await saveUserApiKey(
      request.auth.uid,
      provider as AIProvider,
      rawKey,
      Boolean(isDefault)
    );
    return result;
  } catch (err: any) {
    throw new HttpsError('internal', err.message || 'Failed to save API key');
  }
});

/**
 * Cloud Function: Remove a saved API key.
 */
export const removeApiKey = onCall(async (request: CallableRequest<any>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be signed in.');
  }

  const { provider } = request.data || {};
  if (!provider) {
    throw new HttpsError('invalid-argument', 'Provider is required.');
  }

  try {
    const result = await removeUserApiKey(request.auth.uid, provider as AIProvider);
    return result;
  } catch (err: any) {
    throw new HttpsError('internal', err.message || 'Failed to remove API key');
  }
});

/**
 * Cloud Function: List user's configured API key metadata.
 */
export const getUserApiKeys = onCall(async (request: CallableRequest<any>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be signed in.');
  }

  try {
    const keys = await getUserApiKeyMetadataList(request.auth.uid);
    return { keys };
  } catch (err: any) {
    throw new HttpsError('internal', err.message || 'Failed to list API keys');
  }
});

/**
 * Cloud Function: Set the default AI provider for a user.
 */
export const setDefaultProvider = onCall(async (request: CallableRequest<any>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be signed in.');
  }

  const { provider } = request.data || {};
  if (!provider) {
    throw new HttpsError('invalid-argument', 'Provider is required.');
  }

  try {
    const result = await setDefaultUserApiKey(request.auth.uid, provider as AIProvider);
    return result;
  } catch (err: any) {
    throw new HttpsError('internal', err.message || 'Failed to update default provider');
  }
});

import { AIProvider } from '../../src/types';
import { executeGeminiCall, testGeminiKey, AIProviderCallParams } from './geminiProvider';
import { executeClaudeCall, testClaudeKey } from './claudeProvider';
import { executeOpenAICall, testOpenAIKey } from './openaiProvider';

/**
 * Validates an API key against the specified provider.
 */
export async function validateProviderApiKey(
  provider: AIProvider,
  rawKey: string
): Promise<{ valid: boolean; error?: string }> {
  if (!rawKey || !rawKey.trim()) {
    return { valid: false, error: 'API key cannot be empty' };
  }

  const cleanKey = rawKey.trim();

  switch (provider) {
    case 'gemini':
      return await testGeminiKey(cleanKey);
    case 'claude':
      return await testClaudeKey(cleanKey);
    case 'openai':
      return await testOpenAIKey(cleanKey);
    default:
      return { valid: false, error: `Unsupported AI provider: ${provider}` };
  }
}

/**
 * Executes a unified AI generation call with the user's decrypted API key.
 */
export async function callAIProvider(
  provider: AIProvider,
  decryptedKey: string,
  params: AIProviderCallParams
): Promise<string> {
  if (!decryptedKey) {
    const error = new Error('No API key provided for this AI request');
    (error as any).code = 'no_key_configured';
    (error as any).provider = provider;
    throw error;
  }

  switch (provider) {
    case 'gemini':
      return await executeGeminiCall(decryptedKey, params);
    case 'claude':
      return await executeClaudeCall(decryptedKey, params);
    case 'openai':
      return await executeOpenAICall(decryptedKey, params);
    default: {
      const error = new Error(`Unsupported AI provider: ${provider}`);
      (error as any).code = 'provider_error';
      throw error;
    }
  }
}

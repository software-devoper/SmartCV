import { GoogleGenAI, Schema, Type } from '@google/genai';

export interface AIProviderCallParams {
  systemInstruction?: string;
  prompt: string;
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: Schema;
}

/**
 * Normalizes error messages and codes from Google Gemini.
 */
export function normalizeGeminiError(err: any): { code: string; message: string } {
  const msg = err?.message || String(err);
  const status = err?.status || err?.statusCode || err?.code;

  if (
    msg.includes('API_KEY_INVALID') ||
    msg.includes('API key not valid') ||
    msg.includes('invalid API key') ||
    msg.includes('403 Forbidden') ||
    status === 401 ||
    status === 403
  ) {
    return {
      code: 'invalid_api_key',
      message: 'Your Google Gemini API key is invalid or unauthorized. Please check and re-enter your key.',
    };
  }

  if (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota exceeded') ||
    msg.includes('quota') ||
    status === 429
  ) {
    return {
      code: 'quota_exceeded',
      message: 'Gemini rate limit or quota exceeded. Please wait a moment or verify your quota on Google AI Studio.',
    };
  }

  if (msg.includes('overloaded') || msg.includes('503') || msg.includes('500') || status === 503) {
    return {
      code: 'provider_error',
      message: 'Google Gemini servers are temporarily busy. Please retry in a few seconds.',
    };
  }

  return {
    code: 'provider_error',
    message: msg || 'Gemini API call failed.',
  };
}

/**
 * Validates a Google Gemini API key with an instantaneous, 0-token model list call.
 */
export async function testGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
    const ai = new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: { headers: { 'User-Agent': 'smartcv-builder' }, timeout: 6000 },
    });

    // Fast 300ms call to verify key authenticity without using token quota
    await ai.models.list();
    return { valid: true };
  } catch (err: any) {
    const normalized = normalizeGeminiError(err);
    return { valid: false, error: normalized.message };
  }
}

/**
 * Executes a Gemini request using the provided API key.
 */
export async function executeGeminiCall(
  apiKey: string,
  params: AIProviderCallParams
): Promise<string> {
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const ai = new GoogleGenAI({
    apiKey: cleanKey,
    httpOptions: { headers: { 'User-Agent': 'smartcv-builder' } },
  });

  const models = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config: any = {
        temperature: params.temperature ?? 0.2,
      };
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      if (params.responseMimeType) {
        config.responseMimeType = params.responseMimeType;
      }
      if (params.responseSchema) {
        config.responseSchema = params.responseSchema;
      }

      const res = await ai.models.generateContent({
        model,
        contents: params.prompt,
        config,
      });

      if (res && res.text) {
        return res.text;
      }
    } catch (err: any) {
      lastError = err;
      const normalized = normalizeGeminiError(err);
      // If the key is outright invalid, do not waste time cycling models
      if (normalized.code === 'invalid_api_key') {
        const error = new Error(normalized.message);
        (error as any).code = normalized.code;
        (error as any).provider = 'gemini';
        throw error;
      }
      // Wait briefly before attempting fallback model
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  const normalized = normalizeGeminiError(lastError);
  const error = new Error(normalized.message);
  (error as any).code = normalized.code;
  (error as any).provider = 'gemini';
  throw error;
}

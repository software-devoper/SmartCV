import OpenAI from 'openai';
import { AIProviderCallParams } from './geminiProvider';

/**
 * Normalizes OpenAI errors.
 */
export function normalizeOpenAIError(err: any): { code: string; message: string } {
  const msg = err?.message || String(err);
  const status = err?.status || err?.statusCode;

  if (
    status === 401 ||
    msg.includes('401') ||
    msg.includes('Incorrect API key') ||
    msg.includes('invalid_api_key')
  ) {
    return {
      code: 'invalid_api_key',
      message: 'Your OpenAI API key is invalid or unauthorized. Please verify your key on OpenAI Platform.',
    };
  }

  if (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('insufficient_quota') ||
    msg.includes('quota') ||
    msg.includes('rate limit')
  ) {
    return {
      code: 'quota_exceeded',
      message: 'OpenAI quota exceeded or rate limit reached. Please check your credit balance at OpenAI.',
    };
  }

  return {
    code: 'provider_error',
    message: msg || 'OpenAI API call failed.',
  };
}

/**
 * Validates an OpenAI API key with a fast test models or completion call.
 */
export async function testOpenAIKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
    const openai = new OpenAI({
      apiKey: cleanKey,
      timeout: 6000,
    });

    // Fast call to test key validity without consuming tokens
    await openai.models.list();
    return { valid: true };
  } catch (err: any) {
    const normalized = normalizeOpenAIError(err);
    return { valid: false, error: normalized.message };
  }
}

/**
 * Executes an OpenAI request using the user's API key.
 */
export async function executeOpenAICall(
  apiKey: string,
  params: AIProviderCallParams
): Promise<string> {
  const openai = new OpenAI({
    apiKey: apiKey.trim(),
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (params.systemInstruction) {
    messages.push({
      role: 'system',
      content: params.systemInstruction,
    });
  }

  messages.push({
    role: 'user',
    content: params.prompt,
  });

  const isJsonMode = params.responseMimeType === 'application/json' || Boolean(params.responseSchema);

  const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: params.temperature ?? 0.2,
        response_format: isJsonMode ? { type: 'json_object' } : undefined,
      });

      const choice = response.choices?.[0]?.message?.content;
      return choice || '';
    } catch (err: any) {
      lastError = err;
      const normalized = normalizeOpenAIError(err);
      if (normalized.code === 'invalid_api_key' || normalized.code === 'quota_exceeded') {
        const error = new Error(normalized.message);
        (error as any).code = normalized.code;
        (error as any).provider = 'openai';
        throw error;
      }
    }
  }

  const normalized = normalizeOpenAIError(lastError);
  const error = new Error(normalized.message);
  (error as any).code = normalized.code;
  (error as any).provider = 'openai';
  throw error;
}

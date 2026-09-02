import Anthropic from '@anthropic-ai/sdk';
import { AIProviderCallParams } from './geminiProvider';

/**
 * Normalizes Anthropic Claude errors.
 */
export function normalizeClaudeError(err: any): { code: string; message: string } {
  const msg = err?.message || String(err);
  const status = err?.status || err?.statusCode;

  if (
    status === 401 ||
    msg.includes('401') ||
    msg.includes('invalid x-api-key') ||
    msg.includes('authentication_error') ||
    msg.includes('invalid_api_key')
  ) {
    return {
      code: 'invalid_api_key',
      message: 'Your Anthropic Claude API key is invalid or unauthorized. Please verify your key on Anthropic Console.',
    };
  }

  if (
    status === 429 ||
    msg.includes('rate_limit_error') ||
    msg.includes('429') ||
    msg.includes('quota')
  ) {
    return {
      code: 'rate_limited',
      message: 'Anthropic Claude rate limit exceeded or balance empty. Please check your credit balance.',
    };
  }

  if (
    msg.includes('credit_balance_too_low') ||
    msg.includes('insufficient_quota') ||
    msg.includes('billing')
  ) {
    return {
      code: 'quota_exceeded',
      message: 'Anthropic account balance is too low to complete generation.',
    };
  }

  return {
    code: 'provider_error',
    message: msg || 'Anthropic Claude API call failed.',
  };
}

/**
 * Validates an Anthropic Claude API key with a fast test message.
 */
export async function testClaudeKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const anthropic = new Anthropic({
      apiKey: apiKey.trim(),
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Ping test. Reply pong.' }],
    });

    if (response && response.content) {
      return { valid: true };
    }
    return { valid: true };
  } catch (err: any) {
    const normalized = normalizeClaudeError(err);
    return { valid: false, error: normalized.message };
  }
}

/**
 * Executes a Claude request using the user's API key.
 */
export async function executeClaudeCall(
  apiKey: string,
  params: AIProviderCallParams
): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: apiKey.trim(),
  });

  let fullPrompt = params.prompt;
  let systemPrompt = params.systemInstruction || '';

  if (params.responseMimeType === 'application/json' || params.responseSchema) {
    systemPrompt += `\nCRITICAL INSTRUCTION: You MUST output ONLY valid, parsable raw JSON. Do NOT include markdown code fences (\`\`\`json), do NOT include introductory or concluding conversational text.`;
  }

  try {
    // Model fallback sequence
    const models = ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-haiku-20240307'];
    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await anthropic.messages.create({
          model,
          max_tokens: 4096,
          temperature: params.temperature ?? 0.2,
          system: systemPrompt || undefined,
          messages: [{ role: 'user', content: fullPrompt }],
        });

        // Extract text content from Anthropic content blocks
        const textBlocks = response.content
          .filter((block) => block.type === 'text')
          .map((block: any) => block.text)
          .join('\n');

        return textBlocks;
      } catch (err: any) {
        lastError = err;
        const normalized = normalizeClaudeError(err);
        if (normalized.code === 'invalid_api_key' || normalized.code === 'quota_exceeded') {
          const error = new Error(normalized.message);
          (error as any).code = normalized.code;
          (error as any).provider = 'claude';
          throw error;
        }
      }
    }

    const normalized = normalizeClaudeError(lastError);
    const error = new Error(normalized.message);
    (error as any).code = normalized.code;
    (error as any).provider = 'claude';
    throw error;
  } catch (err: any) {
    if ((err as any).code) throw err;
    const normalized = normalizeClaudeError(err);
    const error = new Error(normalized.message);
    (error as any).code = normalized.code;
    (error as any).provider = 'claude';
    throw error;
  }
}

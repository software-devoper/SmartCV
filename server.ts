import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { AIProvider } from './src/types';
import {
  saveUserApiKey,
  getUserApiKeyMetadataList,
  removeUserApiKey,
  setDefaultUserApiKey,
  getUserDecryptedKey,
} from './server/apiKeyService';
import { validateProviderApiKey } from './server/aiProviders/aiProviderRouter';
import {
  generateFullResume,
  modifyGeneralResume,
  modifySegment,
  enhancePromptText,
  enhanceSingleField,
} from './server/aiResumeService';

const PORT = 3000;

if (getApps().length === 0) {
  try {
    initializeApp();
  } catch {}
}

// Auth middleware to extract and verify user ID from Firebase ID Token or headers
async function resolveAuthUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1].trim();
  }

  const headerUid = (req.headers['x-user-id'] as string) || (req.body?.userId as string);

  if (token) {
    try {
      const decoded = await getAuth().verifyIdToken(token);
      (req as any).userId = decoded.uid;
      return next();
    } catch (err) {
      // If token verification fails (e.g. mock or dev), fallback to provided uid if present
      if (headerUid) {
        (req as any).userId = headerUid;
        return next();
      }
    }
  }

  if (headerUid) {
    (req as any).userId = headerUid;
  }

  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in to manage your AI API keys.',
      code: 'unauthenticated',
    });
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use(resolveAuthUser);

  // -------------------------------------------------------------
  // API KEY MANAGEMENT ENDPOINTS (BYOK)
  // -------------------------------------------------------------

  // 1. Validate API Key without saving
  app.post('/api/keys/validate', async (req: Request, res: Response) => {
    try {
      const { provider, rawKey } = req.body;
      if (!provider || !rawKey) {
        return res.status(400).json({
          error: 'Provider and rawKey are required for validation.',
          code: 'invalid_argument',
        });
      }

      const result = await validateProviderApiKey(provider as AIProvider, rawKey);
      if (!result.valid) {
        return res.status(400).json({
          error: result.error || `Invalid ${provider} API key`,
          code: 'invalid_api_key',
          valid: false,
        });
      }

      res.json({ valid: true, message: `${provider.toUpperCase()} API key is valid and working.` });
    } catch (err: any) {
      console.error('Validation error:', err);
      res.status(500).json({
        error: err.message || 'Failed to validate API key',
        code: 'provider_error',
        valid: false,
      });
    }
  });

  // 2. Encrypt & Save API Key for Authenticated User
  app.post('/api/keys/save', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { provider, rawKey, isDefault } = req.body;

      if (!provider || !rawKey) {
        return res.status(400).json({
          error: 'Provider and rawKey are required.',
          code: 'invalid_argument',
        });
      }

      const result = await saveUserApiKey(
        userId,
        provider as AIProvider,
        rawKey,
        Boolean(isDefault)
      );

      res.json(result);
    } catch (err: any) {
      console.error('Save API key error:', err);
      res.status(400).json({
        error: err.message || 'Failed to save API key',
        code: err.code || 'save_error',
      });
    }
  });

  // 3. List Stored API Key Metadata (No Ciphertext or Plaintext)
  app.get('/api/keys/list', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const keys = await getUserApiKeyMetadataList(userId);
      res.json({ keys });
    } catch (err: any) {
      console.error('List API keys error:', err);
      res.status(500).json({
        error: err.message || 'Failed to list API keys',
        code: 'fetch_error',
      });
    }
  });

  // 4. Remove a Provider Key
  app.post('/api/keys/remove', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { provider } = req.body;

      if (!provider) {
        return res.status(400).json({ error: 'Provider is required', code: 'invalid_argument' });
      }

      const result = await removeUserApiKey(userId, provider as AIProvider);
      res.json(result);
    } catch (err: any) {
      console.error('Remove API key error:', err);
      res.status(500).json({
        error: err.message || 'Failed to remove API key',
        code: 'remove_error',
      });
    }
  });

  // 5. Set Default Provider Key
  app.post('/api/keys/set-default', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { provider } = req.body;

      if (!provider) {
        return res.status(400).json({ error: 'Provider is required', code: 'invalid_argument' });
      }

      const result = await setDefaultUserApiKey(userId, provider as AIProvider);
      res.json(result);
    } catch (err: any) {
      console.error('Set default error:', err);
      res.status(500).json({
        error: err.message || 'Failed to update default provider',
        code: 'default_error',
      });
    }
  });

  // -------------------------------------------------------------
  // AI GENERATION & EDITING ENDPOINTS (POWERED BY USER KEYS)
  // -------------------------------------------------------------

  // 1. Single Field Enhance Endpoint (e.g. Form Editor)
  app.post('/api/gemini/enhance', async (req: Request, res: Response) => {
    try {
      const { text, intent, userType, provider: requestedProvider, directApiKey } = req.body;
      const userId = (req as any).userId;
      const apiKeyHeader = (req.headers['x-api-key'] as string) || directApiKey;

      if (!text || !intent) {
        return res.status(400).json({ error: 'Missing text or intent', code: 'invalid_argument' });
      }

      const keyInfo = await getUserDecryptedKey(userId, requestedProvider, apiKeyHeader);
      const result = await enhanceSingleField(keyInfo, text, intent, userType);
      res.json(result);
    } catch (error: any) {
      console.error('Field Enhance error:', error);
      const statusCode = error.code === 'no_key_configured' ? 400 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to enhance field',
        code: error.code || 'provider_error',
        provider: error.provider,
      });
    }
  });

  // 2. Full Resume Generation (AI Chat Builder)
  app.post('/api/ai-chat/generate', async (req: Request, res: Response) => {
    try {
      const { prompt, photoUrl, provider: requestedProvider, directApiKey } = req.body;
      const userId = (req as any).userId;
      const apiKeyHeader = (req.headers['x-api-key'] as string) || directApiKey;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({
          error: 'A prompt is required for resume generation.',
          code: 'invalid_argument',
        });
      }

      const keyInfo = await getUserDecryptedKey(userId, requestedProvider, apiKeyHeader);
      const result = await generateFullResume(keyInfo, prompt, photoUrl);
      res.json(result);
    } catch (error: any) {
      console.error('AI Full Generation error:', error);
      const statusCode = error.code === 'no_key_configured' ? 400 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to generate structured resume',
        code: error.code || 'provider_error',
        provider: error.provider,
      });
    }
  });

  // 3. General Whole-Resume Modification
  app.post('/api/ai-chat/general-edit', async (req: Request, res: Response) => {
    try {
      const { currentResume, instruction, history, provider: requestedProvider, directApiKey } = req.body;
      const userId = (req as any).userId;
      const apiKeyHeader = (req.headers['x-api-key'] as string) || directApiKey;

      if (!currentResume || !instruction) {
        return res.status(400).json({
          error: 'Current resume data and instruction are required.',
          code: 'invalid_argument',
        });
      }

      const keyInfo = await getUserDecryptedKey(userId, requestedProvider, apiKeyHeader);
      const result = await modifyGeneralResume(keyInfo, currentResume, instruction, history || []);
      res.json(result);
    } catch (error: any) {
      console.error('AI General Edit error:', error);
      const statusCode = error.code === 'no_key_configured' ? 400 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to modify resume',
        code: error.code || 'provider_error',
        provider: error.provider,
      });
    }
  });

  // 4. Segment-Specific Targeted Edit
  app.post('/api/ai-chat/segment-edit', async (req: Request, res: Response) => {
    try {
      const { segmentPath, currentValue, instruction, resumeContext, provider: requestedProvider, directApiKey } =
        req.body;
      const userId = (req as any).userId;
      const apiKeyHeader = (req.headers['x-api-key'] as string) || directApiKey;

      if (!segmentPath || !instruction) {
        return res.status(400).json({
          error: 'Segment path and instruction are required.',
          code: 'invalid_argument',
        });
      }

      const keyInfo = await getUserDecryptedKey(userId, requestedProvider, apiKeyHeader);
      const result = await modifySegment(
        keyInfo,
        segmentPath,
        currentValue,
        instruction,
        resumeContext || {}
      );
      res.json(result);
    } catch (error: any) {
      console.error('AI Segment Edit error:', error);
      const statusCode = error.code === 'no_key_configured' ? 400 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to edit segment',
        code: error.code || 'provider_error',
        provider: error.provider,
      });
    }
  });

  // 5. Prompt Enhancement
  app.post('/api/ai-chat/enhance-prompt', async (req: Request, res: Response) => {
    try {
      const { text, provider: requestedProvider, directApiKey } = req.body;
      const userId = (req as any).userId;
      const apiKeyHeader = (req.headers['x-api-key'] as string) || directApiKey;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({
          error: 'Draft prompt text is required to enhance.',
          code: 'invalid_argument',
        });
      }

      const keyInfo = await getUserDecryptedKey(userId, requestedProvider, apiKeyHeader);
      const result = await enhancePromptText(keyInfo, text);
      res.json(result);
    } catch (error: any) {
      console.error('Prompt Enhancement error:', error);
      const statusCode = error.code === 'no_key_configured' ? 400 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to enhance prompt',
        code: error.code || 'provider_error',
        provider: error.provider,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

import crypto from 'crypto';

// Encryption master key derivation
const MASTER_SECRET =
  process.env.ENCRYPTION_SECRET ||
  process.env.APPLET_SECRET ||
  'smartcv_byok_encryption_secret_key_v1_secure_salt';

// Derive deterministic 32-byte key for AES-256-GCM
const DERIVED_KEY = crypto.createHash('sha256').update(MASTER_SECRET).digest();

/**
 * Encrypts an API key using AES-256-GCM.
 * Format: iv_hex:auth_tag_hex:ciphertext_hex
 */
export function encryptApiKey(plainKey: string): string {
  if (!plainKey || typeof plainKey !== 'string') {
    throw new Error('Invalid key provided for encryption');
  }

  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', DERIVED_KEY, iv);

  let encrypted = cipher.update(plainKey.trim(), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an API key encrypted with AES-256-GCM.
 */
export function decryptApiKey(encryptedData: string): string {
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new Error('Invalid ciphertext provided for decryption');
  }

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted key format');
  }

  const [ivHex, authTagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', DERIVED_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Masks an API key for safe client display (e.g., sk-••••••••1234 or AIza••••4321).
 */
export function maskApiKey(key: string, provider?: string): string {
  const clean = key.trim();
  if (clean.length <= 8) {
    return '••••••••' + clean.slice(-2);
  }

  const last4 = clean.slice(-4);

  if (provider === 'gemini' || clean.startsWith('AIza')) {
    return `AIza••••••••${last4}`;
  }

  if (provider === 'claude' || clean.startsWith('sk-ant-')) {
    return `sk-ant-••••••••${last4}`;
  }

  if (provider === 'openai' || clean.startsWith('sk-')) {
    return `sk-••••••••${last4}`;
  }

  return `••••••••${last4}`;
}

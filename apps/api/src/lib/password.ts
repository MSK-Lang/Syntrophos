import { hash, verify } from '@node-rs/argon2';

const ARGON2ID_ALGORITHM = 2; // Algorithm.Argon2id numeric identifier

const ARGON2_OPTIONS = {
  algorithm: ARGON2ID_ALGORITHM,
  memoryCost: 19456, // 19 MiB according to OWASP minimum recommendation
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface PasswordValidationResult {
  readonly valid: boolean;
  readonly reason?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  if (typeof password !== 'string') {
    return { valid: false, reason: 'Password must be a string' };
  }

  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, reason: 'Password must not exceed 128 characters' };
  }

  if (password.trim().length === 0) {
    return { valid: false, reason: 'Password cannot consist solely of whitespace' };
  }

  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new Error(`Password validation failed: ${validation.reason}`);
  }
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

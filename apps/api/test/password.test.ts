import { describe, expect, it } from 'vitest';
import { hashPassword, normalizeEmail, validatePassword, verifyPassword } from '../src/lib/password.js';

describe('Argon2id Password & Email Normalization Utility', () => {
  it('normalizes email addresses by trimming and lowercasing', () => {
    expect(normalizeEmail('  User@Syntrophos.AI  ')).toBe('user@syntrophos.ai');
    expect(normalizeEmail('TEST.ACCOUNT@DOMAIN.COM')).toBe('test.account@domain.com');
  });

  it('validates password requirements correctly', () => {
    expect(validatePassword('short').valid).toBe(false);
    expect(validatePassword('        ').valid).toBe(false);
    expect(validatePassword('validpassword123').valid).toBe(true);
    expect(validatePassword('a'.repeat(129)).valid).toBe(false);
  });

  it('hashes passwords using Argon2id and verifies valid credentials', async () => {
    const rawPassword = 'SecureSyntrophosPass2026!';
    const passwordHash = await hashPassword(rawPassword);

    expect(passwordHash).toBeDefined();
    expect(passwordHash.startsWith('$argon2id$')).toBe(true);

    const isValid = await verifyPassword(rawPassword, passwordHash);
    expect(isValid).toBe(true);
  });

  it('rejects incorrect passwords against the Argon2id hash', async () => {
    const rawPassword = 'CorrectPassword123';
    const passwordHash = await hashPassword(rawPassword);

    const isWrongValid = await verifyPassword('WrongPassword123', passwordHash);
    expect(isWrongValid).toBe(false);
  });
});

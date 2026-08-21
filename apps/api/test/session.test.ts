import { describe, expect, it } from 'vitest';
import { generateSecureToken, getSessionCookieOptions, hashToken } from '../src/lib/session.js';

describe('Session Token & Cookie Utilities', () => {
  it('generates 32-byte cryptographically secure hex tokens', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();

    expect(token1.length).toBe(64);
    expect(token2.length).toBe(64);
    expect(token1).not.toBe(token2);
  });

  it('produces deterministic SHA-256 token hashes', () => {
    const token = 'sample-unhashed-raw-token-12345';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
    expect(hash1).not.toBe(token);
  });

  it('generates secure, httpOnly, sameSite lax cookie options', () => {
    const devOptions = getSessionCookieOptions(false);
    expect(devOptions.httpOnly).toBe(true);
    expect(devOptions.secure).toBe(false);
    expect(devOptions.sameSite).toBe('lax');
    expect(devOptions.path).toBe('/');

    const prodOptions = getSessionCookieOptions(true);
    expect(prodOptions.secure).toBe(true);
  });
});

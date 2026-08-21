import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'syntrophos_session';
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const INVITATION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generates an unpredictable 32-byte cryptographically secure random token.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Computes the SHA-256 hex hash of a session/invitation token.
 * Raw tokens are NEVER stored in the database; only the hash is persisted.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getSessionCookieOptions(isProduction: boolean) {
  return {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000), // 30 days in seconds
  };
}

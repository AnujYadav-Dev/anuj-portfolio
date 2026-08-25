import { createHash, randomBytes } from 'node:crypto';

/** SHA-256 hash of a token for deterministic storage lookup. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Generate a cryptographically secure random token string. */
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

/** Generate a unique stored filename preserving the original extension. */
export function generateStoredFilename(originalFilename: string): string {
  const extension = originalFilename.includes('.')
    ? originalFilename.slice(originalFilename.lastIndexOf('.'))
    : '';
  return `${randomBytes(16).toString('hex')}${extension}`;
}

import { config } from '@/config/env';

/** JWT access token lifespan in seconds (derived from JWT_ACCESS_TOKEN_TTL_MINUTES). */
export const ACCESS_TOKEN_TTL_SECONDS = config.JWT_ACCESS_TOKEN_TTL_MINUTES * 60;

/** JWT refresh token lifespan in seconds (derived from JWT_REFRESH_TOKEN_TTL_DAYS). */
export const REFRESH_TOKEN_TTL_SECONDS = config.JWT_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60;

/** Bcrypt salt rounds for password hashing. */
export const BCRYPT_ROUNDS = 10;

/** Maximum upload size in bytes (10 MB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Allowed MIME types for media uploads. */
export const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/webp',
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'application/pdf',
] as const;

/** Rate limit: strict endpoints (auth, contact) — requests per 15 minutes. */
export const RATE_LIMIT_STRICT_MAX = 20;

/** Rate limit: analytics endpoints — requests per minute. */
export const RATE_LIMIT_ANALYTICS_MAX = 60;

/** Rate limit: general public GET endpoints — requests per minute. */
export const RATE_LIMIT_PUBLIC_MAX = 120;

/** Rate limit window for strict limiter (15 minutes in ms). */
export const RATE_LIMIT_STRICT_WINDOW_MS = 15 * 60 * 1000;

/** Rate limit window for moderate/permissive limiters (1 minute in ms). */
export const RATE_LIMIT_DEFAULT_WINDOW_MS = 60 * 1000;

/** Email send retry attempts. */
export const EMAIL_RETRY_COUNT = 3;

/** Email retry backoff base delay in ms. */
export const EMAIL_RETRY_BASE_DELAY_MS = 500;

/** Geo lookup timeout in ms. */
export const GEO_LOOKUP_TIMEOUT_MS = 2000;

/** Geo lookup cache TTL in ms (1 hour). */
export const GEO_CACHE_TTL_MS = 60 * 60 * 1000;

/** Dummy bcrypt hash used for constant-time login when user is not found. */
export const DUMMY_PASSWORD_HASH = '$2b$10$JI85F2Cl9JXlxDh3P7LNPe1A3RitMM8vUvp2bNLlBR/fgnGgrX1Ka';

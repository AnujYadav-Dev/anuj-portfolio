import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { ERROR_CODES } from '@portfolio/shared';
import { config } from '@/config/env';
import {
  RATE_LIMIT_ANALYTICS_MAX,
  RATE_LIMIT_DEFAULT_WINDOW_MS,
  RATE_LIMIT_PUBLIC_MAX,
  RATE_LIMIT_STRICT_MAX,
  RATE_LIMIT_STRICT_WINDOW_MS,
} from '@/config/constants';

function rateLimitHandler(_req: Request, res: Response): void {
  res.status(429).json({
    error: {
      code: ERROR_CODES.RATE_LIMITED,
      message: 'Too many requests. Please try again later.',
    },
  });
}

/** Strict rate limiter for auth and contact endpoints. */
export const strictRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_STRICT_WINDOW_MS,
  max: RATE_LIMIT_STRICT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => config.NODE_ENV === 'test',
});

/** Moderate rate limiter for analytics endpoints. */
export const analyticsRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_DEFAULT_WINDOW_MS,
  max: RATE_LIMIT_ANALYTICS_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => config.NODE_ENV === 'test',
});

/** Permissive rate limiter for general public GET endpoints. */
export const publicRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_DEFAULT_WINDOW_MS,
  max: RATE_LIMIT_PUBLIC_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => config.NODE_ENV === 'test',
});

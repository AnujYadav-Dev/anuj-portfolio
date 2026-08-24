import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { config } from '@/config/env';

/**
 * Centralized error handling middleware.
 * Must be registered after all routes.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // Unexpected errors — log full error in dev, hide internals in production
  const isDev = config.NODE_ENV === 'development';

  if (isDev) {
    console.error('[UnhandledError]', err);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? err.message : 'An unexpected error occurred',
    },
  });
}

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { config } from '@/config/env';
import { logger } from '@/config/logger';

/**
 * Centralized error handling middleware.
 * Must be registered after all routes.
 */
export function errorHandler(
  err: Error,
  req: Request,
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

  const isDev = config.NODE_ENV === 'development';

  logger.error(
    {
      err,
      requestId: req.requestId,
    },
    isDev ? err.message : 'Unhandled error',
  );

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? err.message : 'An unexpected error occurred',
    },
  });
}

/** Wrap async route handlers to forward rejected promises to error middleware. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

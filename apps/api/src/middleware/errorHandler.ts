import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { config } from '@/config/env';
import { logger } from '@/config/logger';

/**
 * Centralized error handling middleware.
 * Must be registered after all routes.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) {
    return _next(err);
  }

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

  // Handle Prisma Known Database Errors gracefully
  if ('code' in err && typeof (err as { code?: unknown }).code === 'string') {
    const prismaCode = (err as { code: string }).code;
    if (prismaCode === 'P2002') {
      const meta = (err as { meta?: { target?: string[] | string } }).meta;
      const target = Array.isArray(meta?.target) ? meta.target.join(', ') : 'field';
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: `A record with this unique ${target} already exists`,
        },
      });
      return;
    }
    if (prismaCode === 'P2025') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'The requested record does not exist or was not found',
        },
      });
      return;
    }
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
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

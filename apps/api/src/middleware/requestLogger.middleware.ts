import pinoHttp from 'pino-http';
import type { Request } from 'express';
import { logger } from '@/config/logger';

/** Structured HTTP request logger with correlation ID support. */
export const requestLoggerMiddleware = pinoHttp({
  logger,
  genReqId: (req) => (req as Request).requestId ?? req.id,
  customProps: (req) => ({
    requestId: (req as Request).requestId,
  }),
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});

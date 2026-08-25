import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config/env';
import { logger } from '@/config/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestIdMiddleware } from '@/middleware/requestId.middleware';
import { requestLoggerMiddleware } from '@/middleware/requestLogger.middleware';
import { publicRateLimiter } from '@/middleware/rateLimit.middleware';
import { healthRouter } from '@/routes/health.route';
import { authRouter } from '@/routes/auth.route';
import { mediaRouter } from '@/routes/media.route';
import { analyticsRouter } from '@/routes/analytics.route';
import { contactRouter } from '@/routes/contact.route';

const app = express();

app.set('trust proxy', 1);

app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.STORAGE_PROVIDER === 'local') {
  const uploadPath = path.resolve(process.cwd(), config.UPLOAD_DIR);
  app.use('/uploads', express.static(uploadPath));
}

const apiRouter = express.Router();
apiRouter.use(publicRateLimiter);
apiRouter.use(healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/contact', contactRouter);

app.use('/api/v1', apiRouter);
app.use(errorHandler);

app.listen(config.PORT, () => {
  logger.info(
    { port: config.PORT, env: config.NODE_ENV },
    'API server started',
  );
});

export { app };

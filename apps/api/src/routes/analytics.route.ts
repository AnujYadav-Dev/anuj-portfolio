import { Router } from 'express';
import {
  registerSessionSchema,
  recordViewSchema,
  recordClickSchema,
} from '@portfolio/shared';
import { analyticsController } from '@/controllers/analytics.controller';
import { analyticsRateLimiter } from '@/middleware/rateLimit.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.use(analyticsRateLimiter);

router.post(
  '/session',
  validateBody(registerSessionSchema),
  asyncHandler(analyticsController.registerSession),
);

router.post(
  '/view',
  validateBody(recordViewSchema),
  asyncHandler(analyticsController.recordView),
);

router.post(
  '/click',
  validateBody(recordClickSchema),
  asyncHandler(analyticsController.recordClick),
);

export { router as analyticsRouter };

import { Router } from 'express';
import { statsController } from '@/controllers/stats.controller';
import { publicRateLimiter } from '@/middleware/rateLimit.middleware';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.get('/', publicRateLimiter, asyncHandler(statsController.getStats));

export { router as statsRouter };

import { Router } from 'express';
import { statsController } from '@/controllers/stats.controller';
import { publicRateLimiter } from '@/middleware/rateLimit.middleware';

const router = Router();

router.get('/', publicRateLimiter, statsController.getStats);

export { router as statsRouter };

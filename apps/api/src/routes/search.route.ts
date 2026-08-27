import { Router } from 'express';
import { searchController } from '@/controllers/search.controller';
import { publicRateLimiter } from '@/middleware/rateLimit.middleware';
import { validateQuery } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { searchQuerySchema } from '@portfolio/shared';

const router = Router();

router.get(
  '/',
  publicRateLimiter,
  validateQuery(searchQuerySchema),
  asyncHandler(searchController.search),
);

export { router as searchRouter };

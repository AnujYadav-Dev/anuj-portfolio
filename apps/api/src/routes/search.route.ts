import { Router } from 'express';
import { searchController } from '@/controllers/search.controller';
import { publicRateLimiter } from '@/middleware/rateLimit.middleware';
import { validateQuery } from '@/middleware/validate.middleware';
import { searchQuerySchema } from '@portfolio/shared';

const router = Router();

router.get(
  '/',
  publicRateLimiter,
  validateQuery(searchQuerySchema),
  searchController.search,
);

export { router as searchRouter };

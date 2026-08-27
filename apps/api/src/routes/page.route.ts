import { Router } from 'express';
import { pageController } from '@/controllers/page.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  createPageSchema,
  listPagesQuerySchema,
  updatePageSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Admin collection routes (must precede /:slug)
router.get(
  '/admin/all',
  authenticateAdmin,
  validateQuery(listPagesQuerySchema),
  asyncHandler(pageController.listAdmin),
);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(pageController.getById),
);

// Public list
router.get('/', validateQuery(listPagesQuerySchema), asyncHandler(pageController.listPublic));

// Generic actions
router.post(
  '/',
  authenticateAdmin,
  validateBody(createPageSchema),
  asyncHandler(pageController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updatePageSchema),
  asyncHandler(pageController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(pageController.delete),
);

// Generic public slug route (must be last)
router.get('/:slug', asyncHandler(pageController.getBySlug));

export { router as pageRouter };

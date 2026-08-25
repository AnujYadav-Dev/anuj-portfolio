import { Router } from 'express';
import { pageController } from '@/controllers/page.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
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
  pageController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  pageController.getById,
);

// Public list
router.get('/', validateQuery(listPagesQuerySchema), pageController.listPublic);

// Generic actions
router.post('/', authenticateAdmin, validateBody(createPageSchema), pageController.create);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updatePageSchema),
  pageController.update,
);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), pageController.delete);

// Generic public slug route (must be last)
router.get('/:slug', pageController.getBySlug);

export { router as pageRouter };

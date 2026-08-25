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

// Public routes
router.get('/', validateQuery(listPagesQuerySchema), pageController.listPublic);
router.get('/:slug', pageController.getBySlug);

// Admin routes
router.get('/admin/all', authenticateAdmin, validateQuery(listPagesQuerySchema), pageController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), pageController.getById);
router.post('/', authenticateAdmin, validateBody(createPageSchema), pageController.create);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updatePageSchema),
  pageController.update,
);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), pageController.delete);

export { router as pageRouter };

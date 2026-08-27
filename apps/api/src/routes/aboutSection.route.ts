import { Router } from 'express';
import { aboutSectionController } from '@/controllers/aboutSection.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { reorderSchema, upsertAboutSectionSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:slug and /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(aboutSectionController.reorder),
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(aboutSectionController.reorder),
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(aboutSectionController.reorder),
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(aboutSectionController.reorder),
);

// Admin collection routes (must precede /:slug and /:id)
router.get('/admin/all', authenticateAdmin, asyncHandler(aboutSectionController.listAdmin));
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(aboutSectionController.getById),
);

// Public list
router.get('/', asyncHandler(aboutSectionController.listPublic));

// Generic slug / ID routes
router.get('/:slug', asyncHandler(aboutSectionController.getBySlug));
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertAboutSectionSchema),
  asyncHandler(aboutSectionController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertAboutSectionSchema.partial()),
  asyncHandler(aboutSectionController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(aboutSectionController.delete),
);

export { router as aboutSectionRouter };

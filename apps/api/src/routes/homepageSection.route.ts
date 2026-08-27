import { Router } from 'express';
import { homepageSectionController } from '@/controllers/homepageSection.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { reorderSchema, upsertHomepageSectionSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(homepageSectionController.reorder),
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(homepageSectionController.reorder),
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(homepageSectionController.reorder),
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(homepageSectionController.reorder),
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, asyncHandler(homepageSectionController.listAdmin));
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(homepageSectionController.getById),
);

// Public list
router.get('/', asyncHandler(homepageSectionController.listPublic));

// Generic ID routes
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  asyncHandler(homepageSectionController.getById),
);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertHomepageSectionSchema),
  asyncHandler(homepageSectionController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertHomepageSectionSchema.partial()),
  asyncHandler(homepageSectionController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(homepageSectionController.delete),
);

export { router as homepageSectionRouter };

import { Router } from 'express';
import { aboutSectionController } from '@/controllers/aboutSection.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertAboutSectionSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', aboutSectionController.listPublic);
router.get('/:slug', aboutSectionController.getBySlug);

// Admin
router.get('/admin/all', authenticateAdmin, aboutSectionController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), aboutSectionController.getById);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertAboutSectionSchema),
  aboutSectionController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertAboutSectionSchema.partial()),
  aboutSectionController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  aboutSectionController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  aboutSectionController.reorder,
);

export { router as aboutSectionRouter };

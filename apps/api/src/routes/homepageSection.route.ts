import { Router } from 'express';
import { homepageSectionController } from '@/controllers/homepageSection.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertHomepageSectionSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', homepageSectionController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), homepageSectionController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, homepageSectionController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertHomepageSectionSchema),
  homepageSectionController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertHomepageSectionSchema.partial()),
  homepageSectionController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  homepageSectionController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  homepageSectionController.reorder,
);

export { router as homepageSectionRouter };

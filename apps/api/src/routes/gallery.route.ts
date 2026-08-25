import { Router } from 'express';
import { galleryController } from '@/controllers/gallery.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertGalleryItemSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', galleryController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), galleryController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, galleryController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertGalleryItemSchema),
  galleryController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertGalleryItemSchema.partial()),
  galleryController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  galleryController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  galleryController.reorder,
);

export { router as galleryRouter };

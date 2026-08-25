import { Router } from 'express';
import { galleryController } from '@/controllers/gallery.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertGalleryItemSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  galleryController.reorder,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  galleryController.reorder,
);
router.patch('/reorder', authenticateAdmin, validateBody(reorderSchema), galleryController.reorder);
router.put('/reorder', authenticateAdmin, validateBody(reorderSchema), galleryController.reorder);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, galleryController.listAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  galleryController.getById,
);

// Public list
router.get('/', galleryController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), galleryController.getById);
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
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), galleryController.delete);

export { router as galleryRouter };

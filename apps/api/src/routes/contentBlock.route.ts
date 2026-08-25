import { Router } from 'express';
import { contentBlockController } from '@/controllers/contentBlock.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertContentBlockSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  contentBlockController.reorder,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  contentBlockController.reorder,
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  contentBlockController.reorder,
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  contentBlockController.reorder,
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, contentBlockController.listAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  contentBlockController.getById,
);

// Public list
router.get('/', contentBlockController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), contentBlockController.getById);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertContentBlockSchema),
  contentBlockController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertContentBlockSchema.partial()),
  contentBlockController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  contentBlockController.delete,
);

export { router as contentBlockRouter };

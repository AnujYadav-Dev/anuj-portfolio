import { Router } from 'express';
import { contentBlockController } from '@/controllers/contentBlock.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertContentBlockSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', contentBlockController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), contentBlockController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, contentBlockController.listAdmin);
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
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  contentBlockController.reorder,
);

export { router as contentBlockRouter };

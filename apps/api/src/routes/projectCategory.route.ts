import { Router } from 'express';
import { projectCategoryController } from '@/controllers/projectCategory.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  upsertProjectCategorySchema,
  uuidParamSchema,
  reorderSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', projectCategoryController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), projectCategoryController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, projectCategoryController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertProjectCategorySchema),
  projectCategoryController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertProjectCategorySchema.partial()),
  projectCategoryController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  projectCategoryController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  projectCategoryController.reorder,
);

export { router as projectCategoryRouter };

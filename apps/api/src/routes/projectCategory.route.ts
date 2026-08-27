import { Router } from 'express';
import { projectCategoryController } from '@/controllers/projectCategory.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { upsertProjectCategorySchema, uuidParamSchema, reorderSchema } from '@portfolio/shared';

const router = Router();

// Public
router.get('/', asyncHandler(projectCategoryController.listPublic));
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  asyncHandler(projectCategoryController.getById),
);

// Admin
router.get('/admin/all', authenticateAdmin, asyncHandler(projectCategoryController.listAdmin));
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertProjectCategorySchema),
  asyncHandler(projectCategoryController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertProjectCategorySchema.partial()),
  asyncHandler(projectCategoryController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(projectCategoryController.delete),
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(projectCategoryController.reorder),
);

export { router as projectCategoryRouter };

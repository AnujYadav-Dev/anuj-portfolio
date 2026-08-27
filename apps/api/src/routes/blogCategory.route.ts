import { Router } from 'express';
import { blogCategoryController } from '@/controllers/blogCategory.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { upsertBlogCategorySchema, uuidParamSchema, reorderSchema } from '@portfolio/shared';

const router = Router();

// Public
router.get('/', asyncHandler(blogCategoryController.listPublic));
router.get('/:id', validateParams(uuidParamSchema), asyncHandler(blogCategoryController.getById));

// Admin
router.get('/admin/all', authenticateAdmin, asyncHandler(blogCategoryController.listAdmin));
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertBlogCategorySchema),
  asyncHandler(blogCategoryController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertBlogCategorySchema.partial()),
  asyncHandler(blogCategoryController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(blogCategoryController.delete),
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(blogCategoryController.reorder),
);

export { router as blogCategoryRouter };

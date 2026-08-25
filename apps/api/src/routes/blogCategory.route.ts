import { Router } from 'express';
import { blogCategoryController } from '@/controllers/blogCategory.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { upsertBlogCategorySchema, uuidParamSchema, reorderSchema } from '@portfolio/shared';

const router = Router();

// Public
router.get('/', blogCategoryController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), blogCategoryController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, blogCategoryController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertBlogCategorySchema),
  blogCategoryController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertBlogCategorySchema.partial()),
  blogCategoryController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  blogCategoryController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  blogCategoryController.reorder,
);

export { router as blogCategoryRouter };

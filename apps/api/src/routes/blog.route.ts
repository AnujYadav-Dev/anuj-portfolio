import { Router } from 'express';
import { blogController } from '@/controllers/blog.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import {
  createBlogPostSchema,
  listBlogPostsQuerySchema,
  restoreVersionParamsSchema,
  updateBlogPostSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public routes
router.get('/', validateQuery(listBlogPostsQuerySchema), blogController.listPublic);
router.get('/by/:author/:slug', blogController.getByAuthorAndSlug);
router.get('/:slug', blogController.getBySlug);

// Admin routes
router.get('/admin/all', authenticateAdmin, validateQuery(listBlogPostsQuerySchema), blogController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), blogController.getById);
router.post('/', authenticateAdmin, validateBody(createBlogPostSchema), blogController.create);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateBlogPostSchema),
  blogController.update,
);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), blogController.delete);
router.patch('/:id/status', authenticateAdmin, validateParams(uuidParamSchema), blogController.updateStatus);
router.get('/:id/versions', authenticateAdmin, validateParams(uuidParamSchema), blogController.getVersions);
router.post(
  '/:id/versions/:version/restore',
  authenticateAdmin,
  validateParams(restoreVersionParamsSchema),
  blogController.restoreVersion,
);

export { router as blogRouter };

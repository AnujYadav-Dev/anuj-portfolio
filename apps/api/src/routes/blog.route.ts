import { Router } from 'express';
import { blogController } from '@/controllers/blog.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  createBlogPostSchema,
  listBlogPostsQuerySchema,
  restoreVersionParamsSchema,
  updateBlogPostSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Admin collection routes (must precede /:slug)
router.get(
  '/admin/all',
  authenticateAdmin,
  validateQuery(listBlogPostsQuerySchema),
  asyncHandler(blogController.listAdmin),
);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(blogController.getById),
);

// Specific nested public routes
router.get('/by/:author/:slug', asyncHandler(blogController.getByAuthorAndSlug));

// Public list
router.get('/', validateQuery(listBlogPostsQuerySchema), asyncHandler(blogController.listPublic));

// Generic actions
router.post(
  '/',
  authenticateAdmin,
  validateBody(createBlogPostSchema),
  asyncHandler(blogController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateBlogPostSchema),
  asyncHandler(blogController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(blogController.delete),
);
router.patch(
  '/:id/status',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(blogController.updateStatus),
);
router.put(
  '/:id/status',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(blogController.updateStatus),
);
router.get(
  '/:id/versions',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(blogController.getVersions),
);
router.post(
  '/:id/versions/:version/restore',
  authenticateAdmin,
  validateParams(restoreVersionParamsSchema),
  asyncHandler(blogController.restoreVersion),
);

// Generic public slug route (must be last)
router.get('/:slug', asyncHandler(blogController.getBySlug));

export { router as blogRouter };

import { Router } from 'express';
import { projectController } from '@/controllers/project.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  createProjectSchema,
  listProjectsQuerySchema,
  reorderSchema,
  updateProjectSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:slug and /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(projectController.reorder),
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(projectController.reorder),
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(projectController.reorder),
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(projectController.reorder),
);

// Admin collection routes (must precede /:slug)
router.get(
  '/admin/all',
  authenticateAdmin,
  validateQuery(listProjectsQuerySchema),
  asyncHandler(projectController.listAdmin),
);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(projectController.getById),
);

// Specific nested public routes
router.get('/by/:author/:slug', asyncHandler(projectController.getByAuthorAndSlug));

// Public list
router.get('/', validateQuery(listProjectsQuerySchema), asyncHandler(projectController.listPublic));

// Generic slug / ID routes
router.post(
  '/',
  authenticateAdmin,
  validateBody(createProjectSchema),
  asyncHandler(projectController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateProjectSchema),
  asyncHandler(projectController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(projectController.delete),
);
router.patch(
  '/:id/status',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(projectController.updateStatus),
);
router.put(
  '/:id/status',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(projectController.updateStatus),
);
router.get('/:slug', asyncHandler(projectController.getBySlug));

export { router as projectRouter };

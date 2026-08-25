import { Router } from 'express';
import { projectController } from '@/controllers/project.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import {
  createProjectSchema,
  listProjectsQuerySchema,
  reorderSchema,
  updateProjectSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public routes
router.get('/', validateQuery(listProjectsQuerySchema), projectController.listPublic);
router.get('/by/:author/:slug', projectController.getByAuthorAndSlug);
router.get('/:slug', projectController.getBySlug);

// Admin routes
router.get('/admin/all', authenticateAdmin, validateQuery(listProjectsQuerySchema), projectController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), projectController.getById);
router.post('/', authenticateAdmin, validateBody(createProjectSchema), projectController.create);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateProjectSchema),
  projectController.update,
);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), projectController.delete);
router.patch('/:id/status', authenticateAdmin, validateParams(uuidParamSchema), projectController.updateStatus);
router.patch('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), projectController.reorder);

export { router as projectRouter };

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

// Reorder routes (must precede /:slug and /:id)
router.patch('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), projectController.reorder);
router.put('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), projectController.reorder);
router.patch('/reorder', authenticateAdmin, validateBody(reorderSchema), projectController.reorder);
router.put('/reorder', authenticateAdmin, validateBody(reorderSchema), projectController.reorder);

// Admin collection routes (must precede /:slug)
router.get('/admin/all', authenticateAdmin, validateQuery(listProjectsQuerySchema), projectController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), projectController.getById);

// Specific nested public routes
router.get('/by/:author/:slug', projectController.getByAuthorAndSlug);

// Public list
router.get('/', validateQuery(listProjectsQuerySchema), projectController.listPublic);

// Generic slug / ID routes
router.post('/', authenticateAdmin, validateBody(createProjectSchema), projectController.create);
router.put('/:id', authenticateAdmin, validateParams(uuidParamSchema), validateBody(updateProjectSchema), projectController.update);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), projectController.delete);
router.patch('/:id/status', authenticateAdmin, validateParams(uuidParamSchema), projectController.updateStatus);
router.put('/:id/status', authenticateAdmin, validateParams(uuidParamSchema), projectController.updateStatus);
router.get('/:slug', projectController.getBySlug);

export { router as projectRouter };

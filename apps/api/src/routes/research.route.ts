import { Router } from 'express';
import { researchController } from '@/controllers/research.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import {
  createResearchPaperSchema,
  listResearchPapersQuerySchema,
  updateResearchPaperSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public routes
router.get('/', validateQuery(listResearchPapersQuerySchema), researchController.listPublic);
router.get('/by/:author/:slug', researchController.getByAuthorAndSlug);
router.get('/:slug', researchController.getBySlug);
router.get('/:slug/download', researchController.download);

// Admin routes
router.get('/admin/all', authenticateAdmin, validateQuery(listResearchPapersQuerySchema), researchController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), researchController.getById);
router.post('/', authenticateAdmin, validateBody(createResearchPaperSchema), researchController.create);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateResearchPaperSchema),
  researchController.update,
);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), researchController.delete);
router.patch('/:id/status', authenticateAdmin, validateParams(uuidParamSchema), researchController.updateStatus);

export { router as researchRouter };

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

// Admin collection routes (must precede /:slug)
router.get('/admin/all', authenticateAdmin, validateQuery(listResearchPapersQuerySchema), researchController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), researchController.getById);

// Specific nested public routes
router.get('/by/:author/:slug', researchController.getByAuthorAndSlug);

// Public list
router.get('/', validateQuery(listResearchPapersQuerySchema), researchController.listPublic);

// Generic actions
router.post('/', authenticateAdmin, validateBody(createResearchPaperSchema), researchController.create);
router.put('/:id', authenticateAdmin, validateParams(uuidParamSchema), validateBody(updateResearchPaperSchema), researchController.update);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), researchController.delete);
router.patch('/:id/status', authenticateAdmin, validateParams(uuidParamSchema), researchController.updateStatus);
router.put('/:id/status', authenticateAdmin, validateParams(uuidParamSchema), researchController.updateStatus);

// Generic public slug routes (must be last)
router.get('/:slug/download', researchController.download);
router.get('/:slug', researchController.getBySlug);

export { router as researchRouter };

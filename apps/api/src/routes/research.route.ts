import { Router } from 'express';
import { researchController } from '@/controllers/research.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  createResearchPaperSchema,
  listResearchPapersQuerySchema,
  updateResearchPaperSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Admin collection routes (must precede /:slug)
router.get(
  '/admin/all',
  authenticateAdmin,
  validateQuery(listResearchPapersQuerySchema),
  asyncHandler(researchController.listAdmin),
);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(researchController.getById),
);

// Specific nested public routes
router.get('/by/:author/:slug', asyncHandler(researchController.getByAuthorAndSlug));

// Public list
router.get(
  '/',
  validateQuery(listResearchPapersQuerySchema),
  asyncHandler(researchController.listPublic),
);

// Generic actions
router.post(
  '/',
  authenticateAdmin,
  validateBody(createResearchPaperSchema),
  asyncHandler(researchController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateResearchPaperSchema),
  asyncHandler(researchController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(researchController.delete),
);
router.patch(
  '/:id/status',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(researchController.updateStatus),
);
router.put(
  '/:id/status',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(researchController.updateStatus),
);

// Generic public slug routes (must be last)
router.get('/:slug/download', asyncHandler(researchController.download));
router.get('/:slug', asyncHandler(researchController.getBySlug));

export { router as researchRouter };

import { Router } from 'express';
import { resumeController } from '@/controllers/resume.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { createResumeSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Public
router.get('/active', asyncHandler(resumeController.getActive));
router.get('/active/download', asyncHandler(resumeController.downloadActive));

// Admin
router.get('/admin/all', authenticateAdmin, asyncHandler(resumeController.listAll));
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(resumeController.getById),
);
router.post(
  '/',
  authenticateAdmin,
  validateBody(createResumeSchema),
  asyncHandler(resumeController.create),
);
router.patch(
  '/:id/activate',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(resumeController.setActive),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(resumeController.delete),
);

export { router as resumeRouter };

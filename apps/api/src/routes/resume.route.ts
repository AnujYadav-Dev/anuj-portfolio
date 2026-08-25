import { Router } from 'express';
import { resumeController } from '@/controllers/resume.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { createResumeSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Public
router.get('/active', resumeController.getActive);
router.get('/active/download', resumeController.downloadActive);

// Admin
router.get('/admin/all', authenticateAdmin, resumeController.listAll);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  resumeController.getById,
);
router.post('/', authenticateAdmin, validateBody(createResumeSchema), resumeController.create);
router.patch(
  '/:id/activate',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  resumeController.setActive,
);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), resumeController.delete);

export { router as resumeRouter };

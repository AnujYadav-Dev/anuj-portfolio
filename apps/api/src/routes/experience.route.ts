import { Router } from 'express';
import { experienceController } from '@/controllers/experience.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertExperienceSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', experienceController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), experienceController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, experienceController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertExperienceSchema),
  experienceController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertExperienceSchema.partial()),
  experienceController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  experienceController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  experienceController.reorder,
);

export { router as experienceRouter };

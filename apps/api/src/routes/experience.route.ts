import { Router } from 'express';
import { experienceController } from '@/controllers/experience.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertExperienceSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  experienceController.reorder,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  experienceController.reorder,
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  experienceController.reorder,
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  experienceController.reorder,
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, experienceController.listAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  experienceController.getById,
);

// Public list
router.get('/', experienceController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), experienceController.getById);
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

export { router as experienceRouter };

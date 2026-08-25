import { Router } from 'express';
import { educationController } from '@/controllers/education.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertEducationSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', educationController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), educationController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, educationController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertEducationSchema),
  educationController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertEducationSchema.partial()),
  educationController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  educationController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  educationController.reorder,
);

export { router as educationRouter };

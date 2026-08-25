import { Router } from 'express';
import { opensourceController } from '@/controllers/opensource.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertOpensourceSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', opensourceController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), opensourceController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, opensourceController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertOpensourceSchema),
  opensourceController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertOpensourceSchema.partial()),
  opensourceController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  opensourceController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  opensourceController.reorder,
);

export { router as opensourceRouter };

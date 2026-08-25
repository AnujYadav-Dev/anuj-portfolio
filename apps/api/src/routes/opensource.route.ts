import { Router } from 'express';
import { opensourceController } from '@/controllers/opensource.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertOpensourceSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  opensourceController.reorder,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  opensourceController.reorder,
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  opensourceController.reorder,
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  opensourceController.reorder,
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, opensourceController.listAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  opensourceController.getById,
);

// Public list
router.get('/', opensourceController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), opensourceController.getById);
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

export { router as opensourceRouter };

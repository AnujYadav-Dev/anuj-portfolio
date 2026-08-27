import { Router } from 'express';
import { opensourceController } from '@/controllers/opensource.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { reorderSchema, upsertOpensourceSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(opensourceController.reorder),
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(opensourceController.reorder),
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(opensourceController.reorder),
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(opensourceController.reorder),
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, asyncHandler(opensourceController.listAdmin));
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(opensourceController.getById),
);

// Public list
router.get('/', asyncHandler(opensourceController.listPublic));

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), asyncHandler(opensourceController.getById));
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertOpensourceSchema),
  asyncHandler(opensourceController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertOpensourceSchema.partial()),
  asyncHandler(opensourceController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(opensourceController.delete),
);

export { router as opensourceRouter };

import { Router } from 'express';
import { navItemController } from '@/controllers/navItem.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { reorderSchema, upsertNavItemSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(navItemController.reorder),
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(navItemController.reorder),
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(navItemController.reorder),
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(navItemController.reorder),
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, asyncHandler(navItemController.getTreeAdmin));
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(navItemController.getById),
);

// Public list
router.get('/', asyncHandler(navItemController.getTreePublic));

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), asyncHandler(navItemController.getById));
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertNavItemSchema),
  asyncHandler(navItemController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertNavItemSchema.partial()),
  asyncHandler(navItemController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(navItemController.delete),
);

export { router as navItemRouter };

import { Router } from 'express';
import { navItemController } from '@/controllers/navItem.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertNavItemSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  navItemController.reorder,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  navItemController.reorder,
);
router.patch('/reorder', authenticateAdmin, validateBody(reorderSchema), navItemController.reorder);
router.put('/reorder', authenticateAdmin, validateBody(reorderSchema), navItemController.reorder);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, navItemController.getTreeAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  navItemController.getById,
);

// Public list
router.get('/', navItemController.getTreePublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), navItemController.getById);
router.post('/', authenticateAdmin, validateBody(upsertNavItemSchema), navItemController.create);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertNavItemSchema.partial()),
  navItemController.update,
);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), navItemController.delete);

export { router as navItemRouter };

import { Router } from 'express';
import { achievementController } from '@/controllers/achievement.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertAchievementSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  achievementController.reorder,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  achievementController.reorder,
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  achievementController.reorder,
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  achievementController.reorder,
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, achievementController.listAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  achievementController.getById,
);

// Public list
router.get('/', achievementController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), achievementController.getById);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertAchievementSchema),
  achievementController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertAchievementSchema.partial()),
  achievementController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  achievementController.delete,
);

export { router as achievementRouter };

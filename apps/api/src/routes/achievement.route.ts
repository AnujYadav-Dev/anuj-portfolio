import { Router } from 'express';
import { achievementController } from '@/controllers/achievement.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertAchievementSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', achievementController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), achievementController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, achievementController.listAdmin);
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
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  achievementController.reorder,
);

export { router as achievementRouter };

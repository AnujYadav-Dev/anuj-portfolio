import { Router } from 'express';
import { timelineController } from '@/controllers/timeline.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertTimelineEventSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', timelineController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), timelineController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, timelineController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertTimelineEventSchema),
  timelineController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertTimelineEventSchema.partial()),
  timelineController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  timelineController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  timelineController.reorder,
);

export { router as timelineRouter };

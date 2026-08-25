import { Router } from 'express';
import { timelineController } from '@/controllers/timeline.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertTimelineEventSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  timelineController.reorder,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  timelineController.reorder,
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  timelineController.reorder,
);
router.put('/reorder', authenticateAdmin, validateBody(reorderSchema), timelineController.reorder);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, timelineController.listAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  timelineController.getById,
);

// Public list
router.get('/', timelineController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), timelineController.getById);
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

export { router as timelineRouter };

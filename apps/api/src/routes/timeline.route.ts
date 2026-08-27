import { Router } from 'express';
import { timelineController } from '@/controllers/timeline.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { reorderSchema, upsertTimelineEventSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(timelineController.reorder),
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(timelineController.reorder),
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(timelineController.reorder),
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(timelineController.reorder),
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, asyncHandler(timelineController.listAdmin));
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(timelineController.getById),
);

// Public list
router.get('/', asyncHandler(timelineController.listPublic));

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), asyncHandler(timelineController.getById));
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertTimelineEventSchema),
  asyncHandler(timelineController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertTimelineEventSchema.partial()),
  asyncHandler(timelineController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(timelineController.delete),
);

export { router as timelineRouter };

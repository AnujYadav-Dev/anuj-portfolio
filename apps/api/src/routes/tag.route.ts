import { Router } from 'express';
import { tagController } from '@/controllers/tag.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { createTagSchema, updateTagSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Public
router.get('/', asyncHandler(tagController.listAll));
router.get('/:id', validateParams(uuidParamSchema), asyncHandler(tagController.getById));

// Admin
router.post(
  '/',
  authenticateAdmin,
  validateBody(createTagSchema),
  asyncHandler(tagController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateTagSchema),
  asyncHandler(tagController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(tagController.delete),
);

export { router as tagRouter };

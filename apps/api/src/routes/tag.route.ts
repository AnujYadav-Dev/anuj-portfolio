import { Router } from 'express';
import { tagController } from '@/controllers/tag.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { createTagSchema, updateTagSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Public
router.get('/', tagController.listAll);
router.get('/:id', validateParams(uuidParamSchema), tagController.getById);

// Admin
router.post('/', authenticateAdmin, validateBody(createTagSchema), tagController.create);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateTagSchema),
  tagController.update,
);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), tagController.delete);

export { router as tagRouter };

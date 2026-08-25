import { Router } from 'express';
import { educationController } from '@/controllers/education.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertEducationSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), educationController.reorder);
router.put('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), educationController.reorder);
router.patch('/reorder', authenticateAdmin, validateBody(reorderSchema), educationController.reorder);
router.put('/reorder', authenticateAdmin, validateBody(reorderSchema), educationController.reorder);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, educationController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), educationController.getById);

// Public list
router.get('/', educationController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), educationController.getById);
router.post('/', authenticateAdmin, validateBody(upsertEducationSchema), educationController.create);
router.put('/:id', authenticateAdmin, validateParams(uuidParamSchema), validateBody(upsertEducationSchema.partial()), educationController.update);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), educationController.delete);

export { router as educationRouter };

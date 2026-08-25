import { Router } from 'express';
import { aboutSectionController } from '@/controllers/aboutSection.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertAboutSectionSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:slug and /:id)
router.patch('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), aboutSectionController.reorder);
router.put('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), aboutSectionController.reorder);
router.patch('/reorder', authenticateAdmin, validateBody(reorderSchema), aboutSectionController.reorder);
router.put('/reorder', authenticateAdmin, validateBody(reorderSchema), aboutSectionController.reorder);

// Admin collection routes (must precede /:slug and /:id)
router.get('/admin/all', authenticateAdmin, aboutSectionController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), aboutSectionController.getById);

// Public list
router.get('/', aboutSectionController.listPublic);

// Generic slug / ID routes
router.get('/:slug', aboutSectionController.getBySlug);
router.post('/', authenticateAdmin, validateBody(upsertAboutSectionSchema), aboutSectionController.create);
router.put('/:id', authenticateAdmin, validateParams(uuidParamSchema), validateBody(upsertAboutSectionSchema.partial()), aboutSectionController.update);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), aboutSectionController.delete);

export { router as aboutSectionRouter };

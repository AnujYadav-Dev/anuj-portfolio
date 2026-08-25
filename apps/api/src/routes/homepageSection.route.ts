import { Router } from 'express';
import { homepageSectionController } from '@/controllers/homepageSection.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertHomepageSectionSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), homepageSectionController.reorder);
router.put('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), homepageSectionController.reorder);
router.patch('/reorder', authenticateAdmin, validateBody(reorderSchema), homepageSectionController.reorder);
router.put('/reorder', authenticateAdmin, validateBody(reorderSchema), homepageSectionController.reorder);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, homepageSectionController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), homepageSectionController.getById);

// Public list
router.get('/', homepageSectionController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), homepageSectionController.getById);
router.post('/', authenticateAdmin, validateBody(upsertHomepageSectionSchema), homepageSectionController.create);
router.put('/:id', authenticateAdmin, validateParams(uuidParamSchema), validateBody(upsertHomepageSectionSchema.partial()), homepageSectionController.update);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), homepageSectionController.delete);

export { router as homepageSectionRouter };

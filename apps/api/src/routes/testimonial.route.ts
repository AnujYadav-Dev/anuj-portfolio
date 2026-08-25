import { Router } from 'express';
import { testimonialController } from '@/controllers/testimonial.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertTestimonialSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), testimonialController.reorder);
router.put('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), testimonialController.reorder);
router.patch('/reorder', authenticateAdmin, validateBody(reorderSchema), testimonialController.reorder);
router.put('/reorder', authenticateAdmin, validateBody(reorderSchema), testimonialController.reorder);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, testimonialController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), testimonialController.getById);

// Public list
router.get('/', testimonialController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), testimonialController.getById);
router.post('/', authenticateAdmin, validateBody(upsertTestimonialSchema), testimonialController.create);
router.put('/:id', authenticateAdmin, validateParams(uuidParamSchema), validateBody(upsertTestimonialSchema.partial()), testimonialController.update);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), testimonialController.delete);

export { router as testimonialRouter };

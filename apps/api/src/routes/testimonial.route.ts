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

// Public
router.get('/', testimonialController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), testimonialController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, testimonialController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertTestimonialSchema),
  testimonialController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertTestimonialSchema.partial()),
  testimonialController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  testimonialController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  testimonialController.reorder,
);

export { router as testimonialRouter };

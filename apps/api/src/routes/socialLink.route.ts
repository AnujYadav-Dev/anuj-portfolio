import { Router } from 'express';
import { socialLinkController } from '@/controllers/socialLink.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertSocialLinkSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', socialLinkController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), socialLinkController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, socialLinkController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertSocialLinkSchema),
  socialLinkController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertSocialLinkSchema.partial()),
  socialLinkController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  socialLinkController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  socialLinkController.reorder,
);

export { router as socialLinkRouter };

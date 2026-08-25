import { Router } from 'express';
import { socialLinkController } from '@/controllers/socialLink.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertSocialLinkSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  socialLinkController.reorder,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  socialLinkController.reorder,
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  socialLinkController.reorder,
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  socialLinkController.reorder,
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, socialLinkController.listAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  socialLinkController.getById,
);

// Public list
router.get('/', socialLinkController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), socialLinkController.getById);
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

export { router as socialLinkRouter };

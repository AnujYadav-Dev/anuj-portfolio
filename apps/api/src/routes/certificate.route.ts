import { Router } from 'express';
import { certificateController } from '@/controllers/certificate.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { reorderSchema, upsertCertificateSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(certificateController.reorder),
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(certificateController.reorder),
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(certificateController.reorder),
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(certificateController.reorder),
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, asyncHandler(certificateController.listAdmin));
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(certificateController.getById),
);

// Public list
router.get('/', asyncHandler(certificateController.listPublic));

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), asyncHandler(certificateController.getById));
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertCertificateSchema),
  asyncHandler(certificateController.create),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertCertificateSchema.partial()),
  asyncHandler(certificateController.update),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(certificateController.delete),
);

export { router as certificateRouter };

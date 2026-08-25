import { Router } from 'express';
import { certificateController } from '@/controllers/certificate.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertCertificateSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', certificateController.listPublic);
router.get('/:id', validateParams(uuidParamSchema), certificateController.getById);

// Admin
router.get('/admin/all', authenticateAdmin, certificateController.listAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertCertificateSchema),
  certificateController.create,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertCertificateSchema.partial()),
  certificateController.update,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  certificateController.delete,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  certificateController.reorder,
);

export { router as certificateRouter };

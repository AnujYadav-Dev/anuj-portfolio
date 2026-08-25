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

// Reorder routes (must precede /:id)
router.patch('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), certificateController.reorder);
router.put('/admin/reorder', authenticateAdmin, validateBody(reorderSchema), certificateController.reorder);
router.patch('/reorder', authenticateAdmin, validateBody(reorderSchema), certificateController.reorder);
router.put('/reorder', authenticateAdmin, validateBody(reorderSchema), certificateController.reorder);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, certificateController.listAdmin);
router.get('/admin/:id', authenticateAdmin, validateParams(uuidParamSchema), certificateController.getById);

// Public list
router.get('/', certificateController.listPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), certificateController.getById);
router.post('/', authenticateAdmin, validateBody(upsertCertificateSchema), certificateController.create);
router.put('/:id', authenticateAdmin, validateParams(uuidParamSchema), validateBody(upsertCertificateSchema.partial()), certificateController.update);
router.delete('/:id', authenticateAdmin, validateParams(uuidParamSchema), certificateController.delete);

export { router as certificateRouter };

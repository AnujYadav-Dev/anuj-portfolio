import { Router } from 'express';
import {
  createContactSchema,
  listContactSubmissionsQuerySchema,
  updateContactStatusSchema,
  uuidParamSchema,
} from '@portfolio/shared';
import { contactController } from '@/controllers/contact.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { strictRateLimiter } from '@/middleware/rateLimit.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Public
router.post(
  '/',
  strictRateLimiter,
  validateBody(createContactSchema),
  asyncHandler(contactController.submit),
);

// Admin Inbox
router.get(
  '/admin/submissions',
  authenticateAdmin,
  validateQuery(listContactSubmissionsQuerySchema),
  asyncHandler(contactController.listSubmissions),
);
router.get(
  '/admin/submissions/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(contactController.getById),
);
router.patch(
  '/admin/submissions/:id/status',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateContactStatusSchema),
  asyncHandler(contactController.updateStatus),
);
router.put(
  '/admin/submissions/:id/status',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(updateContactStatusSchema),
  asyncHandler(contactController.updateStatus),
);
router.delete(
  '/admin/submissions/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(contactController.delete),
);

export { router as contactRouter };

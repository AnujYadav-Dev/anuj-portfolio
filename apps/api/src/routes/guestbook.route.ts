import { Router } from 'express';
import { guestbookController } from '@/controllers/guestbook.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { strictRateLimiter } from '@/middleware/rateLimit.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import {
  createGuestbookEntrySchema,
  paginationSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', validateQuery(paginationSchema), guestbookController.listPublic);
router.post(
  '/',
  strictRateLimiter,
  validateBody(createGuestbookEntrySchema),
  guestbookController.create,
);

// Admin Moderation
router.get('/admin/all', authenticateAdmin, validateQuery(paginationSchema), guestbookController.listAdmin);
router.patch(
  '/admin/:id/moderate',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  guestbookController.moderate,
);
router.delete(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  guestbookController.delete,
);

export { router as guestbookRouter };

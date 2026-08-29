import { Router } from 'express';
import { newsletterController } from '@/controllers/newsletter.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { strictRateLimiter } from '@/middleware/rateLimit.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  listNewsletterSubscribersQuerySchema,
  newsletterBroadcastSchema,
  newsletterSubscribeSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.post(
  '/subscribe',
  strictRateLimiter,
  validateBody(newsletterSubscribeSchema),
  asyncHandler(newsletterController.subscribe),
);
router.get('/confirm', asyncHandler(newsletterController.confirm));
router.get('/unsubscribe', asyncHandler(newsletterController.verifyUnsubscribe));
router.post('/unsubscribe', asyncHandler(newsletterController.unsubscribe));
router.post('/resubscribe', asyncHandler(newsletterController.resubscribe));


// Admin
router.get(
  '/admin/subscribers',
  authenticateAdmin,
  validateQuery(listNewsletterSubscribersQuerySchema),
  asyncHandler(newsletterController.listSubscribers),
);
router.get(
  '/admin/export',
  authenticateAdmin,
  asyncHandler(newsletterController.exportSubscribers),
);
router.post(
  '/admin/broadcast',
  authenticateAdmin,
  validateBody(newsletterBroadcastSchema),
  asyncHandler(newsletterController.broadcast),
);
router.delete(
  '/admin/subscribers/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(newsletterController.delete),
);

export { router as newsletterRouter };

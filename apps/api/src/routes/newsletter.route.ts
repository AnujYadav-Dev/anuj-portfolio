import { Router } from 'express';
import { newsletterController } from '@/controllers/newsletter.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { strictRateLimiter } from '@/middleware/rateLimit.middleware';
import { validateBody, validateParams, validateQuery } from '@/middleware/validate.middleware';
import { newsletterSubscribeSchema, paginationSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Public
router.post(
  '/subscribe',
  strictRateLimiter,
  validateBody(newsletterSubscribeSchema),
  newsletterController.subscribe,
);
router.get('/confirm', newsletterController.confirm);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Admin
router.get(
  '/admin/subscribers',
  authenticateAdmin,
  validateQuery(paginationSchema),
  newsletterController.listSubscribers,
);
router.get('/admin/export', authenticateAdmin, newsletterController.exportSubscribers);
router.delete(
  '/admin/subscribers/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  newsletterController.delete,
);

export { router as newsletterRouter };

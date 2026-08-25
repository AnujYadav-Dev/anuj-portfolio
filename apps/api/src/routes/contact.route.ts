import { Router } from 'express';
import { createContactSchema } from '@portfolio/shared';
import { contactController } from '@/controllers/contact.controller';
import { strictRateLimiter } from '@/middleware/rateLimit.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.post(
  '/',
  strictRateLimiter,
  validateBody(createContactSchema),
  asyncHandler(contactController.submit),
);

export { router as contactRouter };

import { Router } from 'express';
import {
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '@portfolio/shared';
import { authController } from '@/controllers/auth.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { strictRateLimiter } from '@/middleware/rateLimit.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.use(strictRateLimiter);

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(authController.login),
);

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  asyncHandler(authController.refresh),
);

router.post(
  '/logout',
  validateBody(refreshTokenSchema),
  asyncHandler(authController.logout),
);

router.get('/me', authenticateAdmin, asyncHandler(authController.me));

router.put(
  '/profile',
  authenticateAdmin,
  validateBody(updateProfileSchema),
  asyncHandler(authController.updateProfile),
);

router.put(
  '/password',
  authenticateAdmin,
  validateBody(changePasswordSchema),
  asyncHandler(authController.changePassword),
);

export { router as authRouter };

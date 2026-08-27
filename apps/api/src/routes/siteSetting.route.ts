import { Router } from 'express';
import { siteSettingController } from '@/controllers/siteSetting.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { updateSiteSettingSchema } from '@portfolio/shared';

const router = Router();

// Public
router.get('/', asyncHandler(siteSettingController.getPublicSettings));

// Admin
router.get('/admin/all', authenticateAdmin, asyncHandler(siteSettingController.listAll));
router.get('/admin/:key', authenticateAdmin, asyncHandler(siteSettingController.getByKey));
router.put(
  '/',
  authenticateAdmin,
  validateBody(updateSiteSettingSchema),
  asyncHandler(siteSettingController.update),
);
router.put('/bulk', authenticateAdmin, asyncHandler(siteSettingController.updateBulk));
router.put('/admin/bulk', authenticateAdmin, asyncHandler(siteSettingController.updateBulk));
router.delete('/admin/:key', authenticateAdmin, asyncHandler(siteSettingController.delete));

export { router as siteSettingRouter };

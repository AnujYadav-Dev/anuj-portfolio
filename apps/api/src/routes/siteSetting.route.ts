import { Router } from 'express';
import { siteSettingController } from '@/controllers/siteSetting.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import { updateSiteSettingSchema } from '@portfolio/shared';

const router = Router();

// Public
router.get('/', siteSettingController.getPublicSettings);

// Admin
router.get('/admin/all', authenticateAdmin, siteSettingController.listAll);
router.get('/admin/:key', authenticateAdmin, siteSettingController.getByKey);
router.put(
  '/',
  authenticateAdmin,
  validateBody(updateSiteSettingSchema),
  siteSettingController.update,
);
router.put(
  '/admin/bulk',
  authenticateAdmin,
  siteSettingController.updateBulk,
);
router.delete(
  '/admin/:key',
  authenticateAdmin,
  siteSettingController.delete,
);

export { router as siteSettingRouter };

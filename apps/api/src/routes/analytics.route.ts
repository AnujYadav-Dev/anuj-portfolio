import { Router } from 'express';
import {
  registerSessionSchema,
  recordViewSchema,
  recordBeaconSchema,
  recordClickSchema,
  paginationSchema,
  analyticsQuerySchema,
  exportAnalyticsQuerySchema,
} from '@portfolio/shared';
import { analyticsController } from '@/controllers/analytics.controller';
import { analyticsRateLimiter } from '@/middleware/rateLimit.middleware';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateQuery } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Public telemetry tracking
router.post(
  '/session',
  analyticsRateLimiter,
  validateBody(registerSessionSchema),
  asyncHandler(analyticsController.registerSession),
);

router.post(
  '/view',
  analyticsRateLimiter,
  validateBody(recordViewSchema),
  asyncHandler(analyticsController.recordView),
);

router.post(
  '/beacon',
  analyticsRateLimiter,
  validateBody(recordBeaconSchema),
  asyncHandler(analyticsController.recordBeacon),
);

router.post(
  '/click',
  analyticsRateLimiter,
  validateBody(recordClickSchema),
  asyncHandler(analyticsController.recordClick),
);

// Admin Telemetry & Insights
router.get(
  '/admin/live-pulse',
  authenticateAdmin,
  asyncHandler(analyticsController.getLivePulse),
);

router.get(
  '/admin/overview',
  authenticateAdmin,
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getAdminOverview),
);

router.get(
  '/admin/timeseries',
  authenticateAdmin,
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getAdminTimeSeries),
);

router.get(
  '/admin/top-pages',
  authenticateAdmin,
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getAdminTopPages),
);

router.get(
  '/admin/visitors',
  authenticateAdmin,
  validateQuery(paginationSchema),
  asyncHandler(analyticsController.getAdminVisitorLogs),
);

router.get(
  '/admin/visitors/:id/journey',
  authenticateAdmin,
  asyncHandler(analyticsController.getVisitorJourney),
);

router.get(
  '/admin/clicks',
  authenticateAdmin,
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getAdminClickStats),
);

router.get(
  '/admin/geo-map',
  authenticateAdmin,
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getGeoMap),
);

router.get(
  '/admin/export',
  authenticateAdmin,
  validateQuery(exportAnalyticsQuerySchema),
  asyncHandler(analyticsController.exportTelemetry),
);

router.get(
  '/admin/audit-logs',
  authenticateAdmin,
  asyncHandler(analyticsController.getAuditLogs),
);

export { router as analyticsRouter };

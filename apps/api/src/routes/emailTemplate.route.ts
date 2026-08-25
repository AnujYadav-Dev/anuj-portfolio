import { Router } from 'express';
import { emailTemplateController } from '@/controllers/emailTemplate.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import { updateEmailTemplateSchema } from '@portfolio/shared';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.use(authenticateAdmin);

router.get('/', asyncHandler(emailTemplateController.listAll));
router.get('/:key', asyncHandler(emailTemplateController.getByKey));
router.put(
  '/:key',
  validateBody(updateEmailTemplateSchema),
  asyncHandler(emailTemplateController.update),
);

export { router as emailTemplateRouter };

import { Router } from 'express';
import { emailTemplateController } from '@/controllers/emailTemplate.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import {
  createEmailTemplateSchema,
  sendTestEmailSchema,
  updateEmailTemplateSchema,
} from '@portfolio/shared';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.use(authenticateAdmin);

router.get('/', asyncHandler(emailTemplateController.listAll));
router.post(
  '/',
  validateBody(createEmailTemplateSchema),
  asyncHandler(emailTemplateController.create),
);
router.post(
  '/test',
  validateBody(sendTestEmailSchema),
  asyncHandler(emailTemplateController.sendTest),
);
router.get('/:id', asyncHandler(emailTemplateController.getById));
router.put(
  '/:id',
  validateBody(updateEmailTemplateSchema),
  asyncHandler(emailTemplateController.update),
);
router.post('/:id/activate', asyncHandler(emailTemplateController.setActive));
router.delete('/:id', asyncHandler(emailTemplateController.delete));

export { router as emailTemplateRouter };

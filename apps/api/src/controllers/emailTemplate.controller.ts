import type { Request, Response } from 'express';
import type { UpdateEmailTemplateInput } from '@portfolio/shared';
import { emailTemplateService } from '@/services/emailTemplate.service';

export const emailTemplateController = {
  async listAll(_req: Request, res: Response): Promise<void> {
    const templates = await emailTemplateService.listAll();
    res.status(200).json({ data: templates });
  },

  async getByKey(req: Request, res: Response): Promise<void> {
    const key = req.params.key as string;
    const template = await emailTemplateService.getByKey(key);
    res.status(200).json({ data: template });
  },

  async update(req: Request, res: Response): Promise<void> {
    const key = req.params.key as string;
    const input = req.validatedBody as UpdateEmailTemplateInput;
    const updated = await emailTemplateService.update(key, input);
    res.status(200).json({ data: updated });
  },
};

import type { Request, Response } from 'express';
import type {
  CreateEmailTemplateInput,
  SendTestEmailInput,
  UpdateEmailTemplateInput,
} from '@portfolio/shared';
import { emailTemplateService } from '@/services/emailTemplate.service';
import { emailService } from '@/services/email.service';

export const emailTemplateController = {
  async listAll(req: Request, res: Response): Promise<void> {
    const purpose = req.query.purpose as string | undefined;
    const templates = await emailTemplateService.listAll(purpose);
    res.status(200).json({ data: templates });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const template = await emailTemplateService.getById(id);
    res.status(200).json({ data: template });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreateEmailTemplateInput;
    const created = await emailTemplateService.create(input);
    res.status(201).json({ data: created, message: 'Email template created successfully' });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const input = req.validatedBody as UpdateEmailTemplateInput;
    const updated = await emailTemplateService.update(id, input);
    res.status(200).json({ data: updated, message: 'Email template updated successfully' });
  },

  async setActive(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const updated = await emailTemplateService.setActive(id);
    res.status(200).json({ data: updated, message: 'Template set as active successfully' });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    await emailTemplateService.delete(id);
    res.status(200).json({ message: 'Email template deleted successfully' });
  },

  async sendTest(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as SendTestEmailInput;
    const result = await emailService.sendTestEmail(input);
    res.status(200).json(result);
  },
};

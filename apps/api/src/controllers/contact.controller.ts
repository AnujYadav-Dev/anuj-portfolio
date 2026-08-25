import type { Request, Response } from 'express';
import type { CreateContactInput, PaginationQuery } from '@portfolio/shared';
import type { ContactStatus } from '@prisma/client';
import { contactService } from '@/services/contact.service';
import { getClientIp, normalizeIpForDb } from '@/utils/ip';

export const contactController = {
  async submit(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreateContactInput;
    const result = await contactService.submit(input, {
      ip: normalizeIpForDb(getClientIp(req)),
      userAgent: req.headers['user-agent'] ?? null,
    });

    res.status(201).json({ data: result });
  },

  async listSubmissions(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as PaginationQuery & { status?: ContactStatus }) ?? req.query;
    const result = await contactService.listSubmissions(query);
    res.json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const result = await contactService.getSubmissionById(id);
    res.json({ data: result });
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const { status } = req.body as { status: ContactStatus };
    const result = await contactService.updateStatus(id, status);
    res.json({ data: result });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await contactService.deleteSubmission(id);
    res.status(204).send();
  },
};

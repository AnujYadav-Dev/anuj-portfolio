import type { Request, Response } from 'express';
import { guestbookService } from '@/services/guestbook.service';
import { getClientIp, normalizeIpForDb } from '@/utils/ip';
import type { CreateGuestbookEntryInput, PaginationQuery } from '@portfolio/shared';
import type { ModerationStatus } from '@prisma/client';

export const guestbookController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as PaginationQuery) ?? req.query;
    const result = await guestbookService.listApprovedEntries(query);
    res.json(result);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const query =
      (req.validatedQuery as PaginationQuery & { moderationStatus?: ModerationStatus }) ??
      req.query;
    const result = await guestbookService.listAdminEntries(query);
    res.json(result);
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreateGuestbookEntryInput;
    const ip = normalizeIpForDb(getClientIp(req));
    const result = await guestbookService.createEntry(input, ip);
    res.status(201).json({ data: result });
  },

  async moderate(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const { status } = req.body as { status: ModerationStatus };
    const result = await guestbookService.moderateEntry(id, status);
    res.json({ data: result });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await guestbookService.deleteEntry(id);
    res.status(204).send();
  },
};

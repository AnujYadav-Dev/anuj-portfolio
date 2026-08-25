import type { Request, Response } from 'express';
import type { CreateContactInput } from '@portfolio/shared';
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
};

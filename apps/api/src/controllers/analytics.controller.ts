import type { Request, Response } from 'express';
import type {
  RegisterSessionInput,
  RecordViewInput,
  RecordClickInput,
} from '@portfolio/shared';
import { trackerService } from '@/services/tracker.service';
import { getClientIp } from '@/utils/ip';

export const analyticsController = {
  async registerSession(req: Request, res: Response): Promise<void> {
    const enabled = await trackerService.isEnabled();
    if (!enabled) {
      res.status(204).send();
      return;
    }

    const input = req.validatedBody as RegisterSessionInput;
    const result = await trackerService.registerSession(input, {
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ data: result });
  },

  async recordView(req: Request, res: Response): Promise<void> {
    const enabled = await trackerService.isEnabled();
    if (!enabled) {
      res.status(204).send();
      return;
    }

    const input = req.validatedBody as RecordViewInput;
    const result = await trackerService.recordView(input);
    res.status(201).json({ data: result });
  },

  async recordClick(req: Request, res: Response): Promise<void> {
    const enabled = await trackerService.isEnabled();
    if (!enabled) {
      res.status(204).send();
      return;
    }

    const input = req.validatedBody as RecordClickInput;
    const result = await trackerService.recordClick(input);
    res.status(201).json({ data: result });
  },
};

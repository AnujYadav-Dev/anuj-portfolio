import type { Request, Response } from 'express';
import { statsService } from '@/services/stats.service';

export const statsController = {
  async getStats(_req: Request, res: Response): Promise<void> {
    const stats = await statsService.getPublicStats();
    res.json({ data: stats });
  },
};

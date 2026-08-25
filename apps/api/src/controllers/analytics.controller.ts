import type { Request, Response } from 'express';
import type {
  RegisterSessionInput,
  RecordViewInput,
  RecordClickInput,
  AnalyticsPeriod,
  PaginationQuery,
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

  // ──────────────────────────────────────────────
  // Admin Telemetry Endpoints
  // ──────────────────────────────────────────────

  async getAdminOverview(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as AnalyticsPeriod) || '30d';
    const overview = await trackerService.getAdminOverview(period);
    res.status(200).json({ data: overview });
  },

  async getAdminTimeSeries(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as AnalyticsPeriod) || '30d';
    const timeseries = await trackerService.getAdminTimeSeries(period);
    res.status(200).json({ data: timeseries });
  },

  async getAdminTopPages(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as AnalyticsPeriod) || '30d';
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const topPages = await trackerService.getAdminTopPages(period, limit);
    res.status(200).json({ data: topPages });
  },

  async getAdminVisitorLogs(req: Request, res: Response): Promise<void> {
    const query = req.validatedQuery as PaginationQuery;
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 20;
    const result = await trackerService.getAdminVisitorLogs(page, pageSize);
    res.status(200).json(result);
  },

  async getAdminClickStats(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as AnalyticsPeriod) || '30d';
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const clickStats = await trackerService.getAdminClickStats(period, limit);
    res.status(200).json({ data: clickStats });
  },
};

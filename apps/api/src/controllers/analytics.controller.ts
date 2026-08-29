import type { Request, Response } from 'express';
import type {
  RegisterSessionInput,
  RecordViewInput,
  RecordClickInput,
  RecordBeaconInput,
  AnalyticsPeriod,
  PaginationQuery,
} from '@portfolio/shared';
import { trackerService } from '@/services/tracker.service';
import { activityLogService } from '@/services/activityLog.service';
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
      headers: req.headers,
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
    const result = await trackerService.recordView(input, {
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      headers: req.headers,
    });
    res.status(201).json({ data: result });
  },

  async recordBeacon(req: Request, res: Response): Promise<void> {
    const enabled = await trackerService.isEnabled();
    if (!enabled) {
      res.status(204).send();
      return;
    }

    const input = (req.validatedBody || req.body) as RecordBeaconInput;
    const result = await trackerService.recordBeacon(input);
    res.status(200).json({ data: result });
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

  async getLivePulse(_req: Request, res: Response): Promise<void> {
    const pulse = await trackerService.getLivePulse();
    res.status(200).json({ data: pulse });
  },

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

  async getVisitorJourney(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const journey = await trackerService.getVisitorJourney(id);
    if (!journey) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Visitor not found' } });
      return;
    }
    res.status(200).json({ data: journey });
  },

  async getAdminClickStats(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as AnalyticsPeriod) || '30d';
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const clickStats = await trackerService.getAdminClickStats(period, limit);
    res.status(200).json({ data: clickStats });
  },

  async getGeoMap(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as AnalyticsPeriod) || '30d';
    const mapData = await trackerService.getGeoMapDistribution(period);
    res.status(200).json({ data: mapData });
  },

  async exportTelemetry(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as AnalyticsPeriod) || '30d';
    const type = (req.query.type as 'visitors' | 'pages' | 'clicks' | 'all') || 'all';
    const format = (req.query.format as 'csv' | 'json') || 'csv';

    const output = await trackerService.exportTelemetry(type, period, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="portfolio-telemetry-${type}-${period}.csv"`);
      res.status(200).send(output);
      return;
    }

    res.status(200).json({ data: output });
  },

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const logs = await activityLogService.getRecent(limit);
    res.status(200).json({ data: logs });
  },
};

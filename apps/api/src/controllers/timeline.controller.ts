import type { Request, Response } from 'express';
import { timelineService } from '@/services/timeline.service';
import type { ReorderInput, UpsertTimelineEventInput } from '@portfolio/shared';

export const timelineController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const eventType = req.query.eventType ? String(req.query.eventType) : undefined;
    const records = await timelineService.listEvents(true, eventType);
    res.json({ data: records });
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const eventType = req.query.eventType ? String(req.query.eventType) : undefined;
    const records = await timelineService.listEvents(false, eventType);
    res.json({ data: records });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const record = await timelineService.getEventById(id);
    res.json({ data: record });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertTimelineEventInput;
    const record = await timelineService.createEvent(input);
    res.status(201).json({ data: record });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertTimelineEventInput>;
    const record = await timelineService.updateEvent(id, input);
    res.json({ data: record });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await timelineService.deleteEvent(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await timelineService.reorderEvents(items);
    res.json({ data: { success: true } });
  },
};

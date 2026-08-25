import type { Request, Response } from 'express';
import { educationService } from '@/services/education.service';
import type { ReorderInput, UpsertEducationInput } from '@portfolio/shared';

export const educationController = {
  async listPublic(_req: Request, res: Response): Promise<void> {
    const records = await educationService.listEducation(true);
    res.json({ data: records });
  },

  async listAdmin(_req: Request, res: Response): Promise<void> {
    const records = await educationService.listEducation(false);
    res.json({ data: records });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const record = await educationService.getEducationById(id);
    res.json({ data: record });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertEducationInput;
    const record = await educationService.createEducation(input);
    res.status(201).json({ data: record });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertEducationInput>;
    const record = await educationService.updateEducation(id, input);
    res.json({ data: record });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await educationService.deleteEducation(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await educationService.reorderEducation(items);
    res.json({ data: { success: true } });
  },
};

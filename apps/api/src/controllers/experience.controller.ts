import type { Request, Response } from 'express';
import { experienceService } from '@/services/experience.service';
import type { ReorderInput, UpsertExperienceInput } from '@portfolio/shared';

export const experienceController = {
  async listPublic(_req: Request, res: Response): Promise<void> {
    const experiences = await experienceService.listExperiences(true);
    res.json({ data: experiences });
  },

  async listAdmin(_req: Request, res: Response): Promise<void> {
    const experiences = await experienceService.listExperiences(false);
    res.json({ data: experiences });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const experience = await experienceService.getExperienceById(id);
    res.json({ data: experience });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertExperienceInput;
    const experience = await experienceService.createExperience(input);
    res.status(201).json({ data: experience });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertExperienceInput>;
    const experience = await experienceService.updateExperience(id, input);
    res.json({ data: experience });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await experienceService.deleteExperience(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await experienceService.reorderExperiences(items);
    res.json({ data: { success: true } });
  },
};

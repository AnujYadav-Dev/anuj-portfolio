import type { Request, Response } from 'express';
import { achievementService } from '@/services/achievement.service';
import type { ReorderInput, UpsertAchievementInput } from '@portfolio/shared';

export const achievementController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const isFeatured = req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined;
    const records = await achievementService.listAchievements(true, isFeatured);
    res.json({ data: records });
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const isFeatured = req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined;
    const records = await achievementService.listAchievements(false, isFeatured);
    res.json({ data: records });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const record = await achievementService.getAchievementById(id);
    res.json({ data: record });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertAchievementInput;
    const record = await achievementService.createAchievement(input);
    res.status(201).json({ data: record });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertAchievementInput>;
    const record = await achievementService.updateAchievement(id, input);
    res.json({ data: record });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await achievementService.deleteAchievement(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await achievementService.reorderAchievements(items);
    res.json({ data: { success: true } });
  },
};

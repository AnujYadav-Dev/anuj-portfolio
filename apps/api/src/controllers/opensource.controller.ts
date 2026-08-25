import type { Request, Response } from 'express';
import { opensourceService } from '@/services/opensource.service';
import type { ReorderInput, UpsertOpensourceInput } from '@portfolio/shared';

export const opensourceController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const isFeatured =
      req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined;
    const records = await opensourceService.listContributions(true, isFeatured);
    res.json({ data: records });
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const isFeatured =
      req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined;
    const records = await opensourceService.listContributions(false, isFeatured);
    res.json({ data: records });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const record = await opensourceService.getContributionById(id);
    res.json({ data: record });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertOpensourceInput;
    const record = await opensourceService.createContribution(input);
    res.status(201).json({ data: record });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertOpensourceInput>;
    const record = await opensourceService.updateContribution(id, input);
    res.json({ data: record });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await opensourceService.deleteContribution(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await opensourceService.reorderContributions(items);
    res.json({ data: { success: true } });
  },
};

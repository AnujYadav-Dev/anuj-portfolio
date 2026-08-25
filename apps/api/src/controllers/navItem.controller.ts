import type { Request, Response } from 'express';
import { navItemService } from '@/services/navItem.service';
import type { ReorderInput, UpsertNavItemInput } from '@portfolio/shared';

export const navItemController = {
  async getTreePublic(req: Request, res: Response): Promise<void> {
    const location = req.query.location ? String(req.query.location) : undefined;
    const tree = await navItemService.getNavTree(location, true);
    res.json({ data: tree });
  },

  async getTreeAdmin(req: Request, res: Response): Promise<void> {
    const location = req.query.location ? String(req.query.location) : undefined;
    const tree = await navItemService.getNavTree(location, false);
    res.json({ data: tree });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const item = await navItemService.getNavItemById(id);
    res.json({ data: item });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertNavItemInput;
    const item = await navItemService.createNavItem(input);
    res.status(201).json({ data: item });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertNavItemInput>;
    const item = await navItemService.updateNavItem(id, input);
    res.json({ data: item });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await navItemService.deleteNavItem(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await navItemService.reorderNavItems(items);
    res.json({ data: { success: true } });
  },
};

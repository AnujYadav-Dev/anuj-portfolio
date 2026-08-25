import type { Request, Response } from 'express';
import { contentBlockService } from '@/services/contentBlock.service';
import type { ReorderInput, UpsertContentBlockInput } from '@portfolio/shared';

export const contentBlockController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const { pageId, homepageSectionId } = req.query as { pageId?: string; homepageSectionId?: string };
    const blocks = await contentBlockService.listBlocks(pageId, homepageSectionId, true);
    res.json({ data: blocks });
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const { pageId, homepageSectionId } = req.query as { pageId?: string; homepageSectionId?: string };
    const blocks = await contentBlockService.listBlocks(pageId, homepageSectionId, false);
    res.json({ data: blocks });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const block = await contentBlockService.getBlockById(id);
    res.json({ data: block });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertContentBlockInput;
    const block = await contentBlockService.createBlock(input);
    res.status(201).json({ data: block });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertContentBlockInput>;
    const block = await contentBlockService.updateBlock(id, input);
    res.json({ data: block });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await contentBlockService.deleteBlock(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await contentBlockService.reorderBlocks(items);
    res.json({ data: { success: true } });
  },
};

import type { Request, Response } from 'express';
import { tagService } from '@/services/tag.service';
import type { CreateTagInput, UpdateTagInput } from '@portfolio/shared';

export const tagController = {
  async listAll(_req: Request, res: Response): Promise<void> {
    const tags = await tagService.listTags();
    res.json({ data: tags });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const tag = await tagService.getTagById(id);
    res.json({ data: tag });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreateTagInput;
    const tag = await tagService.createTag(input);
    res.status(201).json({ data: tag });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as UpdateTagInput;
    const tag = await tagService.updateTag(id, input);
    res.json({ data: tag });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await tagService.deleteTag(id);
    res.status(204).send();
  },
};

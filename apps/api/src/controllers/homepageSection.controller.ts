import type { Request, Response } from 'express';
import { homepageSectionService } from '@/services/homepageSection.service';
import type { ReorderInput, UpsertHomepageSectionInput } from '@portfolio/shared';

export const homepageSectionController = {
  async listPublic(_req: Request, res: Response): Promise<void> {
    const sections = await homepageSectionService.listSections(true);
    res.json({ data: sections });
  },

  async listAdmin(_req: Request, res: Response): Promise<void> {
    const sections = await homepageSectionService.listSections(false);
    res.json({ data: sections });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const section = await homepageSectionService.getSectionById(id);
    res.json({ data: section });
  },

  async getByKey(req: Request, res: Response): Promise<void> {
    const key = String(req.params.key);
    const section = await homepageSectionService.getSectionByKey(key);
    res.json({ data: section });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertHomepageSectionInput;
    const section = await homepageSectionService.createSection(input);
    res.status(201).json({ data: section });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertHomepageSectionInput>;
    const section = await homepageSectionService.updateSection(id, input);
    res.json({ data: section });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await homepageSectionService.deleteSection(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await homepageSectionService.reorderSections(items);
    res.json({ data: { success: true } });
  },
};

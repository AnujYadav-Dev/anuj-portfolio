import type { Request, Response } from 'express';
import { aboutSectionService } from '@/services/aboutSection.service';
import type { ReorderInput, UpsertAboutSectionInput } from '@portfolio/shared';

export const aboutSectionController = {
  async listPublic(_req: Request, res: Response): Promise<void> {
    const sections = await aboutSectionService.listSections(true);
    res.json({ data: sections });
  },

  async listAdmin(_req: Request, res: Response): Promise<void> {
    const sections = await aboutSectionService.listSections(false);
    res.json({ data: sections });
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const slug = String(req.params.slug);
    const section = await aboutSectionService.getSectionBySlug(slug);
    res.json({ data: section });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const section = await aboutSectionService.getSectionById(id);
    res.json({ data: section });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertAboutSectionInput;
    const section = await aboutSectionService.createSection(input);
    res.status(201).json({ data: section });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertAboutSectionInput>;
    const section = await aboutSectionService.updateSection(id, input);
    res.json({ data: section });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await aboutSectionService.deleteSection(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await aboutSectionService.reorderSections(items);
    res.json({ data: { success: true } });
  },
};

import type { Request, Response } from 'express';
import { pageService } from '@/services/page.service';
import type { CreatePageInput, ListPagesQuery, UpdatePageInput } from '@portfolio/shared';

export const pageController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as ListPagesQuery) ?? req.query;
    const result = await pageService.listPublic(query as ListPagesQuery);
    res.json(result);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as ListPagesQuery) ?? req.query;
    const result = await pageService.listAdmin(query as ListPagesQuery);
    res.json(result);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const slug = String(req.params.slug);
    const page = await pageService.getBySlug(slug, false);
    res.json({ data: page });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const page = await pageService.getById(id);
    res.json({ data: page });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreatePageInput;
    const page = await pageService.create(input);
    res.status(201).json({ data: page });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as UpdatePageInput;
    const page = await pageService.update(id, input);
    res.json({ data: page });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await pageService.delete(id);
    res.status(204).send();
  },
};

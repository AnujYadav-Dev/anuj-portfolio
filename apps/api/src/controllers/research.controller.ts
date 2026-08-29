import type { Request, Response } from 'express';
import { researchService } from '@/services/research.service';
import type {
  CreateResearchPaperInput,
  ListResearchPapersQuery,
  UpdateResearchPaperInput,
} from '@portfolio/shared';

export const researchController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as ListResearchPapersQuery) ?? req.query;
    const result = await researchService.listPublished(query as ListResearchPapersQuery);
    res.json(result);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as ListResearchPapersQuery) ?? req.query;
    const result = await researchService.listAdmin(query as ListResearchPapersQuery);
    res.json(result);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const slug = String(req.params.slug);
    const paper = await researchService.getBySlug(slug);
    res.json({ data: paper });
  },

  async getByAuthorAndSlug(req: Request, res: Response): Promise<void> {
    const author = String(req.params.author);
    const slug = String(req.params.slug);
    const paper = await researchService.getBySlug(slug, author);
    res.json({ data: paper });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const paper = await researchService.getById(id);
    res.json({ data: paper });
  },

  async download(req: Request, res: Response): Promise<void> {
    const slug = String(req.params.slug);
    const paper = await researchService.getBySlug(slug);
    if (!paper.pdfUrl) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'PDF attachment not found' } });
      return;
    }
    res.redirect(paper.pdfUrl);
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreateResearchPaperInput;
    const authorId = req.author?.id ?? '';
    const paper = await researchService.create(authorId, input);
    res.status(201).json({ data: paper });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as UpdateResearchPaperInput;
    const paper = await researchService.update(id, input, req.author?.id);
    res.json({ data: paper });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await researchService.delete(id);
    res.status(204).send();
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const { status } = req.body;
    const paper = await researchService.updateStatus(id, status);
    res.json({ data: paper });
  },
};

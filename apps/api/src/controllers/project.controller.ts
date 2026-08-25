import type { Request, Response } from 'express';
import { projectService } from '@/services/project.service';
import type {
  CreateProjectInput,
  ListProjectsQuery,
  ReorderInput,
  UpdateProjectInput,
} from '@portfolio/shared';

export const projectController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as ListProjectsQuery) ?? req.query;
    const result = await projectService.listPublished(query as ListProjectsQuery);
    res.json(result);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as ListProjectsQuery) ?? req.query;
    const result = await projectService.listAdmin(query as ListProjectsQuery);
    res.json(result);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const slug = String(req.params.slug);
    const project = await projectService.getBySlug(slug);
    res.json({ data: project });
  },

  async getByAuthorAndSlug(req: Request, res: Response): Promise<void> {
    const author = String(req.params.author);
    const slug = String(req.params.slug);
    const project = await projectService.getBySlug(slug, author);
    res.json({ data: project });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const project = await projectService.getById(id);
    res.json({ data: project });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreateProjectInput;
    const authorId = req.author?.id ?? '';
    const project = await projectService.create(authorId, input);
    res.status(201).json({ data: project });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as UpdateProjectInput;
    const authorId = req.author?.id;
    const project = await projectService.update(id, input, authorId);
    res.json({ data: project });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await projectService.delete(id);
    res.status(204).send();
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const { status } = req.body;
    const project = await projectService.updateStatus(id, status);
    res.json({ data: project });
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await projectService.reorder(items);
    res.json({ data: { success: true } });
  },
};

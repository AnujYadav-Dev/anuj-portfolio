import type { Request, Response } from 'express';
import { blogService } from '@/services/blog.service';
import type {
  CreateBlogPostInput,
  ListBlogPostsQuery,
  UpdateBlogPostInput,
} from '@portfolio/shared';

export const blogController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as ListBlogPostsQuery) ?? req.query;
    const result = await blogService.listPublished(query as ListBlogPostsQuery);
    res.json(result);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as ListBlogPostsQuery) ?? req.query;
    const result = await blogService.listAdmin(query as ListBlogPostsQuery);
    res.json(result);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const slug = String(req.params.slug);
    const post = await blogService.getBySlug(slug);
    res.json({ data: post });
  },

  async getByAuthorAndSlug(req: Request, res: Response): Promise<void> {
    const author = String(req.params.author);
    const slug = String(req.params.slug);
    const post = await blogService.getBySlug(slug, author);
    res.json({ data: post });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const post = await blogService.getById(id);
    res.json({ data: post });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreateBlogPostInput;
    const authorId = req.author?.id ?? '';
    const post = await blogService.create(authorId, input);
    res.status(201).json({ data: post });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as UpdateBlogPostInput;
    const authorId = req.author?.id;
    const post = await blogService.update(id, input, authorId);
    res.json({ data: post });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await blogService.delete(id);
    res.status(204).send();
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const { status } = req.body;
    const post = await blogService.updateStatus(id, status);
    res.json({ data: post });
  },

  async getVersions(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const versions = await blogService.getVersions(id);
    res.json({ data: versions });
  },

  async restoreVersion(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const version = Number(req.params.version);
    const authorId = req.author?.id;
    const restored = await blogService.restoreVersion(id, version, authorId);
    res.json({ data: restored });
  },
};

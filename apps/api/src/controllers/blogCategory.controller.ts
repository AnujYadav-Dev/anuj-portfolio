import type { Request, Response } from 'express';
import { blogCategoryService } from '@/services/blogCategory.service';
import type { ReorderInput, UpsertBlogCategoryInput } from '@portfolio/shared';

export const blogCategoryController = {
  async listPublic(_req: Request, res: Response): Promise<void> {
    const categories = await blogCategoryService.listCategories(true);
    res.json({ data: categories });
  },

  async listAdmin(_req: Request, res: Response): Promise<void> {
    const categories = await blogCategoryService.listCategories(false);
    res.json({ data: categories });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const category = await blogCategoryService.getCategoryById(id);
    res.json({ data: category });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertBlogCategoryInput;
    const category = await blogCategoryService.createCategory(input);
    res.status(201).json({ data: category });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertBlogCategoryInput>;
    const category = await blogCategoryService.updateCategory(id, input);
    res.json({ data: category });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await blogCategoryService.deleteCategory(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await blogCategoryService.reorderCategories(items);
    res.json({ data: { success: true } });
  },
};

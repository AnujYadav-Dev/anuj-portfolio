import type { Request, Response } from 'express';
import { projectCategoryService } from '@/services/projectCategory.service';
import type { ReorderInput, UpsertProjectCategoryInput } from '@portfolio/shared';

export const projectCategoryController = {
  async listPublic(_req: Request, res: Response): Promise<void> {
    const categories = await projectCategoryService.listCategories(true);
    res.json({ data: categories });
  },

  async listAdmin(_req: Request, res: Response): Promise<void> {
    const categories = await projectCategoryService.listCategories(false);
    res.json({ data: categories });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const category = await projectCategoryService.getCategoryById(id);
    res.json({ data: category });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertProjectCategoryInput;
    const category = await projectCategoryService.createCategory(input);
    res.status(201).json({ data: category });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertProjectCategoryInput>;
    const category = await projectCategoryService.updateCategory(id, input);
    res.json({ data: category });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await projectCategoryService.deleteCategory(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await projectCategoryService.reorderCategories(items);
    res.json({ data: { success: true } });
  },
};

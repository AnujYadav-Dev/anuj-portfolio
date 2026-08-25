import type { Request, Response } from 'express';
import { skillService } from '@/services/skill.service';
import type { ReorderInput, UpsertSkillCategoryInput, UpsertSkillInput } from '@portfolio/shared';

export const skillController = {
  // Categories
  async listCategoriesPublic(_req: Request, res: Response): Promise<void> {
    const categories = await skillService.listCategoriesWithSkills(true);
    res.json({ data: categories });
  },

  async listCategoriesAdmin(_req: Request, res: Response): Promise<void> {
    const categories = await skillService.listCategoriesWithSkills(false);
    res.json({ data: categories });
  },

  async getCategoryById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const category = await skillService.getCategoryById(id);
    res.json({ data: category });
  },

  async createCategory(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertSkillCategoryInput;
    const category = await skillService.createCategory(input);
    res.status(201).json({ data: category });
  },

  async updateCategory(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertSkillCategoryInput>;
    const category = await skillService.updateCategory(id, input);
    res.json({ data: category });
  },

  async deleteCategory(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await skillService.deleteCategory(id);
    res.status(204).send();
  },

  async reorderCategories(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await skillService.reorderCategories(items);
    res.json({ data: { success: true } });
  },

  // Skills
  async listSkillsPublic(req: Request, res: Response): Promise<void> {
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
    const skills = await skillService.listSkills(categoryId, true);
    res.json({ data: skills });
  },

  async listSkillsAdmin(req: Request, res: Response): Promise<void> {
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
    const skills = await skillService.listSkills(categoryId, false);
    res.json({ data: skills });
  },

  async getSkillById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const skill = await skillService.getSkillById(id);
    res.json({ data: skill });
  },

  async createSkill(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertSkillInput;
    const skill = await skillService.createSkill(input);
    res.status(201).json({ data: skill });
  },

  async updateSkill(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertSkillInput>;
    const skill = await skillService.updateSkill(id, input);
    res.json({ data: skill });
  },

  async deleteSkill(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await skillService.deleteSkill(id);
    res.status(204).send();
  },

  async reorderSkills(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await skillService.reorderSkills(items);
    res.json({ data: { success: true } });
  },
};

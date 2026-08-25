import { skillCategoryRepository } from '@/repositories/skillCategory.repository';
import { skillRepository } from '@/repositories/skill.repository';
import { mapSkillCategoryToDto, mapSkillToDto } from '@/utils/mappers';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { slugify } from '@/utils/slug';
import type {
  SkillCategoryDto,
  SkillDto,
  UpsertSkillCategoryInput,
  UpsertSkillInput,
} from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const skillService = {
  // Categories
  async listCategoriesWithSkills(onlyEnabled = true): Promise<SkillCategoryDto[]> {
    const categories = await skillCategoryRepository.findAllWithSkills(onlyEnabled);
    return categories.map(mapSkillCategoryToDto);
  },

  async getCategoryById(id: string): Promise<SkillCategoryDto> {
    const category = await skillCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError(`Skill category '${id}' not found`);
    }
    return mapSkillCategoryToDto(category);
  },

  async createCategory(input: UpsertSkillCategoryInput): Promise<SkillCategoryDto> {
    const slug = slugify(input.slug || input.name);
    const existing = await skillCategoryRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`Skill category with slug '${slug}' already exists`);
    }

    const created = await skillCategoryRepository.create({
      name: input.name,
      slug,
      description: input.description ?? null,
      icon: input.icon ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });
    return mapSkillCategoryToDto(created);
  },

  async updateCategory(id: string, input: Partial<UpsertSkillCategoryInput>): Promise<SkillCategoryDto> {
    await skillService.getCategoryById(id);

    const updateData: Prisma.SkillCategoryUpdateInput = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.icon !== undefined) updateData.icon = input.icon || null;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await skillCategoryRepository.update(id, updateData);
    return mapSkillCategoryToDto(updated);
  },

  async deleteCategory(id: string): Promise<void> {
    await skillService.getCategoryById(id);
    await skillCategoryRepository.delete(id);
  },

  async reorderCategories(items: { id: string; sortOrder: number }[]): Promise<void> {
    await skillCategoryRepository.reorder(items);
  },

  // Skills
  async listSkills(categoryId?: string, onlyEnabled = true): Promise<SkillDto[]> {
    const where: Prisma.SkillWhereInput = {};
    if (onlyEnabled) where.isEnabled = true;
    if (categoryId) where.categoryId = categoryId;

    const skills = await skillRepository.findMany(where);
    return skills.map(mapSkillToDto);
  },

  async getSkillById(id: string): Promise<SkillDto> {
    const skill = await skillRepository.findById(id);
    if (!skill) {
      throw new NotFoundError(`Skill '${id}' not found`);
    }
    return mapSkillToDto(skill);
  },

  async createSkill(input: UpsertSkillInput): Promise<SkillDto> {
    await skillService.getCategoryById(input.categoryId);

    const slug = slugify(input.slug || input.name);
    const existing = await skillRepository.findBySlugAndCategory(input.categoryId, slug);
    if (existing) {
      throw new ConflictError(`Skill with slug '${slug}' already exists in this category`);
    }

    const created = await skillRepository.create({
      name: input.name,
      slug,
      icon: input.icon ?? null,
      proficiency: input.proficiency ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
      categoryId: input.categoryId,
    });
    return mapSkillToDto(created);
  },

  async updateSkill(id: string, input: Partial<UpsertSkillInput>): Promise<SkillDto> {
    await skillService.getSkillById(id);

    const updateData: Prisma.SkillUncheckedUpdateInput = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.icon !== undefined) updateData.icon = input.icon || null;
    if (input.proficiency !== undefined) updateData.proficiency = input.proficiency ?? null;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;

    const updated = await skillRepository.update(id, updateData);
    return mapSkillToDto(updated);
  },

  async deleteSkill(id: string): Promise<void> {
    await skillService.getSkillById(id);
    await skillRepository.delete(id);
  },

  async reorderSkills(items: { id: string; sortOrder: number }[]): Promise<void> {
    await skillRepository.reorder(items);
  },
};

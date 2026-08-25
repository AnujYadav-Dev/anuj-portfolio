import { projectCategoryRepository } from '@/repositories/projectCategory.repository';
import { mapProjectCategoryToDto } from '@/utils/mappers';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { slugify } from '@/utils/slug';
import type { ProjectCategoryDto } from '@portfolio/shared';

export interface CreateProjectCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isEnabled?: boolean;
}

export interface UpdateProjectCategoryInput extends Partial<CreateProjectCategoryInput> {}

export const projectCategoryService = {
  async listCategories(onlyEnabled = true): Promise<ProjectCategoryDto[]> {
    const categories = await projectCategoryRepository.findAll(onlyEnabled);
    return categories.map(mapProjectCategoryToDto);
  },

  async getCategoryById(id: string): Promise<ProjectCategoryDto> {
    const category = await projectCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError(`Project category '${id}' not found`);
    }
    return mapProjectCategoryToDto(category);
  },

  async createCategory(input: CreateProjectCategoryInput): Promise<ProjectCategoryDto> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);
    const existing = await projectCategoryRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`Project category with slug '${slug}' already exists`);
    }

    const created = await projectCategoryRepository.create({
      name: input.name,
      slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });
    return mapProjectCategoryToDto(created);
  },

  async updateCategory(id: string, input: UpdateProjectCategoryInput): Promise<ProjectCategoryDto> {
    await projectCategoryService.getCategoryById(id);

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = slugify(input.slug);
    if (input.description !== undefined) data.description = input.description;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) data.isEnabled = input.isEnabled;

    const updated = await projectCategoryRepository.update(id, data);
    return mapProjectCategoryToDto(updated);
  },

  async deleteCategory(id: string): Promise<void> {
    await projectCategoryService.getCategoryById(id);
    await projectCategoryRepository.delete(id);
  },

  async reorderCategories(items: { id: string; sortOrder: number }[]): Promise<void> {
    await projectCategoryRepository.reorder(items);
  },
};

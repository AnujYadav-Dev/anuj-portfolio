import { blogCategoryRepository } from '@/repositories/blogCategory.repository';
import { mapBlogCategoryToDto } from '@/utils/mappers';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { slugify } from '@/utils/slug';
import type { BlogCategoryDto } from '@portfolio/shared';

export interface CreateBlogCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isEnabled?: boolean;
}

export interface UpdateBlogCategoryInput extends Partial<CreateBlogCategoryInput> {}

export const blogCategoryService = {
  async listCategories(onlyEnabled = true): Promise<BlogCategoryDto[]> {
    const categories = await blogCategoryRepository.findAll(onlyEnabled);
    return categories.map(mapBlogCategoryToDto);
  },

  async getCategoryById(id: string): Promise<BlogCategoryDto> {
    const category = await blogCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError(`Blog category '${id}' not found`);
    }
    return mapBlogCategoryToDto(category);
  },

  async createCategory(input: CreateBlogCategoryInput): Promise<BlogCategoryDto> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);
    const existing = await blogCategoryRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`Blog category with slug '${slug}' already exists`);
    }

    const created = await blogCategoryRepository.create({
      name: input.name,
      slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });
    return mapBlogCategoryToDto(created);
  },

  async updateCategory(id: string, input: UpdateBlogCategoryInput): Promise<BlogCategoryDto> {
    await blogCategoryService.getCategoryById(id);

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = slugify(input.slug);
    if (input.description !== undefined) data.description = input.description;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) data.isEnabled = input.isEnabled;

    const updated = await blogCategoryRepository.update(id, data);
    return mapBlogCategoryToDto(updated);
  },

  async deleteCategory(id: string): Promise<void> {
    await blogCategoryService.getCategoryById(id);
    await blogCategoryRepository.delete(id);
  },

  async reorderCategories(items: { id: string; sortOrder: number }[]): Promise<void> {
    await blogCategoryRepository.reorder(items);
  },
};

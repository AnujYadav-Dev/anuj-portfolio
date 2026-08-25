import { tagRepository } from '@/repositories/tag.repository';
import { mapTagToDto } from '@/utils/mappers';
import { slugify } from '@/utils/slug';
import { NotFoundError, ConflictError } from '@/utils/errors';
import type { CreateTagInput, TagDto, TagWithCountDto, UpdateTagInput } from '@portfolio/shared';

export const tagService = {
  async listTags(): Promise<TagWithCountDto[]> {
    const tags = await tagRepository.findAll();
    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      createdAt: t.createdAt.toISOString(),
      count: t.count,
    }));
  },

  async getTagById(id: string): Promise<TagDto> {
    const tag = await tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundError(`Tag '${id}' not found`);
    }
    return mapTagToDto(tag);
  },

  async createTag(input: CreateTagInput): Promise<TagDto> {
    const slug = slugify(input.slug || input.name);
    const existing = await tagRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`Tag with slug '${slug}' already exists`);
    }

    const created = await tagRepository.create(input.name, slug);
    return mapTagToDto(created);
  },

  async updateTag(id: string, input: UpdateTagInput): Promise<TagDto> {
    await tagService.getTagById(id);

    const updateData: Record<string, string> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);

    const updated = await tagRepository.update(id, updateData);
    return mapTagToDto(updated);
  },

  async deleteTag(id: string): Promise<void> {
    await tagService.getTagById(id);
    await tagRepository.delete(id);
  },
};

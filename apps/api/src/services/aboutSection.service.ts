import { aboutSectionRepository } from '@/repositories/aboutSection.repository';
import { mapAboutSectionToDto } from '@/utils/mappers';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { slugify } from '@/utils/slug';
import type { AboutSectionDto, UpsertAboutSectionInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const aboutSectionService = {
  async listSections(onlyEnabled = true): Promise<AboutSectionDto[]> {
    const sections = await aboutSectionRepository.findAll(onlyEnabled);
    return sections.map(mapAboutSectionToDto);
  },

  async getSectionById(id: string): Promise<AboutSectionDto> {
    const section = await aboutSectionRepository.findById(id);
    if (!section) {
      throw new NotFoundError(`About section '${id}' not found`);
    }
    return mapAboutSectionToDto(section);
  },

  async getSectionBySlug(slug: string): Promise<AboutSectionDto> {
    const section = await aboutSectionRepository.findBySlug(slug);
    if (!section) {
      throw new NotFoundError(`About section with slug '${slug}' not found`);
    }
    return mapAboutSectionToDto(section);
  },

  async createSection(input: UpsertAboutSectionInput): Promise<AboutSectionDto> {
    const slug = slugify(input.slug || input.title);
    const existing = await aboutSectionRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`About section with slug '${slug}' already exists`);
    }

    const created = await aboutSectionRepository.create({
      title: input.title,
      slug,
      content: input.content ?? null,
      icon: input.icon ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      seoKeywords: input.seoKeywords ?? null,
    });
    return mapAboutSectionToDto(created);
  },

  async updateSection(id: string, input: Partial<UpsertAboutSectionInput>): Promise<AboutSectionDto> {
    await aboutSectionService.getSectionById(id);

    const updateData: Prisma.AboutSectionUpdateInput = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.content !== undefined) updateData.content = input.content || null;
    if (input.icon !== undefined) updateData.icon = input.icon || null;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;
    if (input.seoTitle !== undefined) updateData.seoTitle = input.seoTitle || null;
    if (input.seoDescription !== undefined) updateData.seoDescription = input.seoDescription || null;
    if (input.seoKeywords !== undefined) updateData.seoKeywords = input.seoKeywords || null;

    const updated = await aboutSectionRepository.update(id, updateData);
    return mapAboutSectionToDto(updated);
  },

  async deleteSection(id: string): Promise<void> {
    await aboutSectionService.getSectionById(id);
    await aboutSectionRepository.delete(id);
  },

  async reorderSections(items: { id: string; sortOrder: number }[]): Promise<void> {
    await aboutSectionRepository.reorder(items);
  },
};

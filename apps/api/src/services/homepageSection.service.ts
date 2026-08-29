import { homepageSectionRepository } from '@/repositories/homepageSection.repository';
import { activityLogService } from '@/services/activityLog.service';
import { mapHomepageSectionToDto } from '@/utils/mappers';
import { NotFoundError, ConflictError } from '@/utils/errors';
import type { HomepageSectionDto, UpsertHomepageSectionInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const homepageSectionService = {
  async listSections(onlyEnabled = true): Promise<HomepageSectionDto[]> {
    const sections = await homepageSectionRepository.findAll(onlyEnabled);
    return sections.map(mapHomepageSectionToDto);
  },

  async getSectionById(id: string): Promise<HomepageSectionDto> {
    const section = await homepageSectionRepository.findById(id);
    if (!section) {
      throw new NotFoundError(`Homepage section '${id}' not found`);
    }
    return mapHomepageSectionToDto(section);
  },

  async getSectionByKey(sectionKey: string): Promise<HomepageSectionDto> {
    const section = await homepageSectionRepository.findByKey(sectionKey);
    if (!section) {
      throw new NotFoundError(`Homepage section with key '${sectionKey}' not found`);
    }
    return mapHomepageSectionToDto(section);
  },

  async createSection(input: UpsertHomepageSectionInput): Promise<HomepageSectionDto> {
    const existing = await homepageSectionRepository.findByKey(input.sectionKey);
    if (existing) {
      throw new ConflictError(`Homepage section with key '${input.sectionKey}' already exists`);
    }

    const created = await homepageSectionRepository.create({
      sectionKey: input.sectionKey,
      title: input.title ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
      config: (input.config ?? {}) as Prisma.InputJsonValue,
    });

    activityLogService.log({
      action: 'homepage_section_create',
      entityType: 'homepage_section',
      entityId: created.id,
      details: { sectionKey: created.sectionKey, title: created.title },
    });

    return mapHomepageSectionToDto(created);
  },

  async updateSection(
    id: string,
    input: Partial<UpsertHomepageSectionInput>,
  ): Promise<HomepageSectionDto> {
    await homepageSectionService.getSectionById(id);

    const updateData: Prisma.HomepageSectionUpdateInput = {};
    if (input.sectionKey !== undefined) updateData.sectionKey = input.sectionKey;
    if (input.title !== undefined) updateData.title = input.title || null;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;
    if (input.config !== undefined) updateData.config = input.config as Prisma.InputJsonValue;

    const updated = await homepageSectionRepository.update(id, updateData);

    activityLogService.log({
      action: 'homepage_section_update',
      entityType: 'homepage_section',
      entityId: updated.id,
      details: { sectionKey: updated.sectionKey, title: updated.title },
    });

    return mapHomepageSectionToDto(updated);
  },

  async deleteSection(id: string): Promise<void> {
    const existing = await homepageSectionService.getSectionById(id);
    await homepageSectionRepository.delete(id);

    activityLogService.log({
      action: 'homepage_section_delete',
      entityType: 'homepage_section',
      entityId: id,
      details: { sectionKey: existing.sectionKey, title: existing.title },
    });
  },

  async reorderSections(items: { id: string; sortOrder: number }[]): Promise<void> {
    await homepageSectionRepository.reorder(items);
  },
};

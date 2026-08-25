import { contentBlockRepository } from '@/repositories/contentBlock.repository';
import { mapContentBlockToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type {
  ContentBlockDto,
  UpsertContentBlockInput,
} from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const contentBlockService = {
  async listBlocks(pageId?: string, homepageSectionId?: string, onlyEnabled = true): Promise<ContentBlockDto[]> {
    const where: Prisma.ContentBlockWhereInput = {};
    if (onlyEnabled) where.isEnabled = true;
    if (pageId) where.pageId = pageId;
    if (homepageSectionId) where.homepageSectionId = homepageSectionId;

    const blocks = await contentBlockRepository.findMany(where);
    return blocks.map(mapContentBlockToDto);
  },

  async getBlockById(id: string): Promise<ContentBlockDto> {
    const block = await contentBlockRepository.findById(id);
    if (!block) {
      throw new NotFoundError(`Content block '${id}' not found`);
    }
    return mapContentBlockToDto(block);
  },

  async createBlock(input: UpsertContentBlockInput): Promise<ContentBlockDto> {
    const created = await contentBlockRepository.create({
      blockType: input.blockType as any,
      title: input.title ?? null,
      content: input.content ?? null,
      mediaId: input.mediaId ?? null,
      config: (input.config ?? {}) as Prisma.InputJsonValue,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
      pageId: input.pageId ?? null,
      homepageSectionId: input.homepageSectionId ?? null,
    });
    return mapContentBlockToDto(created);
  },

  async updateBlock(id: string, input: Partial<UpsertContentBlockInput>): Promise<ContentBlockDto> {
    await contentBlockService.getBlockById(id);

    const updateData: Prisma.ContentBlockUncheckedUpdateInput = {};
    if (input.blockType !== undefined) updateData.blockType = input.blockType as any;
    if (input.title !== undefined) updateData.title = input.title || null;
    if (input.content !== undefined) updateData.content = input.content || null;
    if (input.mediaId !== undefined) updateData.mediaId = input.mediaId || null;
    if (input.config !== undefined) updateData.config = input.config as Prisma.InputJsonValue;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;
    if (input.pageId !== undefined) updateData.pageId = input.pageId || null;
    if (input.homepageSectionId !== undefined) updateData.homepageSectionId = input.homepageSectionId || null;

    const updated = await contentBlockRepository.update(id, updateData);
    return mapContentBlockToDto(updated);
  },

  async deleteBlock(id: string): Promise<void> {
    await contentBlockService.getBlockById(id);
    await contentBlockRepository.delete(id);
  },

  async reorderBlocks(items: { id: string; sortOrder: number }[]): Promise<void> {
    await contentBlockRepository.reorder(items);
  },
};

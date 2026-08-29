import { galleryRepository } from '@/repositories/gallery.repository';
import { activityLogService } from '@/services/activityLog.service';
import { mapGalleryItemToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { GalleryItemDto, UpsertGalleryItemInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const galleryService = {
  async listItems(onlyEnabled = true, category?: string): Promise<GalleryItemDto[]> {
    const items = await galleryRepository.findAll(onlyEnabled, category);
    return items.map(mapGalleryItemToDto);
  },

  async getItemById(id: string): Promise<GalleryItemDto> {
    const item = await galleryRepository.findById(id);
    if (!item) {
      throw new NotFoundError(`Gallery item '${id}' not found`);
    }
    return mapGalleryItemToDto(item);
  },

  async createItem(input: UpsertGalleryItemInput): Promise<GalleryItemDto> {
    const created = await galleryRepository.create({
      title: input.title ?? null,
      description: input.description ?? null,
      category: input.category ?? null,
      mediaId: input.mediaId,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });

    activityLogService.log({
      action: 'gallery_create',
      entityType: 'gallery_item',
      entityId: created.id,
      details: { title: created.title, category: created.category },
    });

    return mapGalleryItemToDto(created);
  },

  async updateItem(id: string, input: Partial<UpsertGalleryItemInput>): Promise<GalleryItemDto> {
    await galleryService.getItemById(id);

    const updateData: Prisma.GalleryItemUncheckedUpdateInput = {};
    if (input.title !== undefined) updateData.title = input.title || null;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.category !== undefined) updateData.category = input.category || null;
    if (input.mediaId !== undefined) updateData.mediaId = input.mediaId;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await galleryRepository.update(id, updateData);

    activityLogService.log({
      action: 'gallery_update',
      entityType: 'gallery_item',
      entityId: updated.id,
      details: { title: updated.title, category: updated.category },
    });

    return mapGalleryItemToDto(updated);
  },

  async deleteItem(id: string): Promise<void> {
    const existing = await galleryService.getItemById(id);
    await galleryRepository.delete(id);

    activityLogService.log({
      action: 'gallery_delete',
      entityType: 'gallery_item',
      entityId: id,
      details: { title: existing.title, category: existing.category },
    });
  },

  async reorderItems(items: { id: string; sortOrder: number }[]): Promise<void> {
    await galleryRepository.reorder(items);
  },
};

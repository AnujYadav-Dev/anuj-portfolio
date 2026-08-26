import { navItemRepository } from '@/repositories/navItem.repository';
import { mapNavItemToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { NavItemDto, UpsertNavItemInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const navItemService = {
  async getNavTree(location?: any, onlyEnabled = true): Promise<NavItemDto[]> {
    const navItems = await navItemRepository.findTree(location, onlyEnabled);
    return navItems.map(mapNavItemToDto);
  },

  async getNavItemById(id: string): Promise<NavItemDto> {
    const navItem = await navItemRepository.findById(id);
    if (!navItem) {
      throw new NotFoundError(`Navigation item '${id}' not found`);
    }
    return mapNavItemToDto(navItem);
  },

  async createNavItem(input: UpsertNavItemInput): Promise<NavItemDto> {
    const created = await navItemRepository.create({
      label: input.label,
      url: input.url ?? '',
      location: input.location as any,
      itemType: (input.itemType as any) ?? 'link',
      description: input.description ?? null,
      icon: input.icon ?? null,
      badge: input.badge ?? null,
      config: (input.config as any) ?? {},
      isExternal: input.isExternal ?? false,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
      parentId: input.parentId ?? null,
    });
    return mapNavItemToDto(created);
  },

  async updateNavItem(id: string, input: Partial<UpsertNavItemInput>): Promise<NavItemDto> {
    await navItemService.getNavItemById(id);

    const updateData: Prisma.NavItemUncheckedUpdateInput = {};
    if (input.label !== undefined) updateData.label = input.label;
    if (input.url !== undefined) updateData.url = input.url ?? '';
    if (input.location !== undefined) updateData.location = input.location as any;

    if (input.itemType !== undefined) updateData.itemType = input.itemType as any;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.icon !== undefined) updateData.icon = input.icon;
    if (input.badge !== undefined) updateData.badge = input.badge;
    if (input.config !== undefined) updateData.config = input.config as any;
    if (input.isExternal !== undefined) updateData.isExternal = input.isExternal;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;
    if (input.parentId !== undefined) updateData.parentId = input.parentId || null;

    const updated = await navItemRepository.update(id, updateData);
    return mapNavItemToDto(updated);
  },


  async deleteNavItem(id: string): Promise<void> {
    await navItemService.getNavItemById(id);
    await navItemRepository.delete(id);
  },

  async reorderNavItems(items: { id: string; sortOrder: number }[]): Promise<void> {
    await navItemRepository.reorder(items);
  },
};

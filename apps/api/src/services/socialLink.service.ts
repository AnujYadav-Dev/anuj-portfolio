import { socialLinkRepository } from '@/repositories/socialLink.repository';
import { mapSocialLinkToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { SocialLinkDto, UpsertSocialLinkInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const socialLinkService = {
  async listSocialLinks(onlyEnabled = true): Promise<SocialLinkDto[]> {
    const links = await socialLinkRepository.findAll(onlyEnabled);
    return links.map(mapSocialLinkToDto);
  },

  async getSocialLinkById(id: string): Promise<SocialLinkDto> {
    const link = await socialLinkRepository.findById(id);
    if (!link) {
      throw new NotFoundError(`Social link '${id}' not found`);
    }
    return mapSocialLinkToDto(link);
  },

  async createSocialLink(input: UpsertSocialLinkInput): Promise<SocialLinkDto> {
    const created = await socialLinkRepository.create({
      platform: input.platform,
      label: input.label,
      url: input.url,
      icon: input.icon ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });
    return mapSocialLinkToDto(created);
  },

  async updateSocialLink(
    id: string,
    input: Partial<UpsertSocialLinkInput>,
  ): Promise<SocialLinkDto> {
    await socialLinkService.getSocialLinkById(id);

    const updateData: Prisma.SocialLinkUpdateInput = {};
    if (input.platform !== undefined) updateData.platform = input.platform;
    if (input.label !== undefined) updateData.label = input.label;
    if (input.url !== undefined) updateData.url = input.url;
    if (input.icon !== undefined) updateData.icon = input.icon || null;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await socialLinkRepository.update(id, updateData);
    return mapSocialLinkToDto(updated);
  },

  async deleteSocialLink(id: string): Promise<void> {
    await socialLinkService.getSocialLinkById(id);
    await socialLinkRepository.delete(id);
  },

  async reorderSocialLinks(items: { id: string; sortOrder: number }[]): Promise<void> {
    await socialLinkRepository.reorder(items);
  },
};

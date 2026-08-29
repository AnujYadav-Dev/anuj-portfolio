import { achievementRepository } from '@/repositories/achievement.repository';
import { activityLogService } from '@/services/activityLog.service';
import { mapAchievementToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { AchievementDto, UpsertAchievementInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const achievementService = {
  async listAchievements(onlyEnabled = true, isFeatured?: boolean): Promise<AchievementDto[]> {
    const records = await achievementRepository.findAll(onlyEnabled, isFeatured);
    return records.map(mapAchievementToDto);
  },

  async getAchievementById(id: string): Promise<AchievementDto> {
    const record = await achievementRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`Achievement '${id}' not found`);
    }
    return mapAchievementToDto(record);
  },

  async createAchievement(input: UpsertAchievementInput): Promise<AchievementDto> {
    const created = await achievementRepository.create({
      title: input.title,
      description: input.description ?? null,
      date: input.date ? new Date(input.date) : null,
      issuer: input.issuer ?? null,
      url: input.url ?? null,
      imageId: input.imageId ?? null,
      isFeatured: input.isFeatured ?? false,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });

    activityLogService.log({
      action: 'achievement_create',
      entityType: 'achievement',
      entityId: created.id,
      details: { title: created.title, issuer: created.issuer },
    });

    return mapAchievementToDto(created);
  },

  async updateAchievement(
    id: string,
    input: Partial<UpsertAchievementInput>,
  ): Promise<AchievementDto> {
    await achievementService.getAchievementById(id);

    const updateData: Prisma.AchievementUncheckedUpdateInput = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.date !== undefined) updateData.date = input.date ? new Date(input.date) : null;
    if (input.issuer !== undefined) updateData.issuer = input.issuer || null;
    if (input.url !== undefined) updateData.url = input.url || null;
    if (input.imageId !== undefined) updateData.imageId = input.imageId || null;
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await achievementRepository.update(id, updateData);

    activityLogService.log({
      action: 'achievement_update',
      entityType: 'achievement',
      entityId: updated.id,
      details: { title: updated.title, issuer: updated.issuer },
    });

    return mapAchievementToDto(updated);
  },

  async deleteAchievement(id: string): Promise<void> {
    const existing = await achievementService.getAchievementById(id);
    await achievementRepository.delete(id);

    activityLogService.log({
      action: 'achievement_delete',
      entityType: 'achievement',
      entityId: id,
      details: { title: existing.title, issuer: existing.issuer },
    });
  },

  async reorderAchievements(items: { id: string; sortOrder: number }[]): Promise<void> {
    await achievementRepository.reorder(items);
  },
};

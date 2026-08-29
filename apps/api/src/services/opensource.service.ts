import { opensourceRepository } from '@/repositories/opensource.repository';
import { activityLogService } from '@/services/activityLog.service';
import { mapOpensourceToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { OpensourceContributionDto, UpsertOpensourceInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const opensourceService = {
  async listContributions(
    onlyEnabled = true,
    isFeatured?: boolean,
  ): Promise<OpensourceContributionDto[]> {
    const records = await opensourceRepository.findAll(onlyEnabled, isFeatured);
    return records.map(mapOpensourceToDto);
  },

  async getContributionById(id: string): Promise<OpensourceContributionDto> {
    const record = await opensourceRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`Open source contribution '${id}' not found`);
    }
    return mapOpensourceToDto(record);
  },

  async createContribution(input: UpsertOpensourceInput): Promise<OpensourceContributionDto> {
    const created = await opensourceRepository.create({
      name: input.name,
      description: input.description ?? null,
      url: input.url,
      role: input.role ?? null,
      stars: input.stars ?? null,
      forks: input.forks ?? null,
      language: input.language ?? null,
      isFeatured: input.isFeatured ?? false,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });

    activityLogService.log({
      action: 'opensource_create',
      entityType: 'opensource_contribution',
      entityId: created.id,
      details: { name: created.name, role: created.role },
    });

    return mapOpensourceToDto(created);
  },

  async updateContribution(
    id: string,
    input: Partial<UpsertOpensourceInput>,
  ): Promise<OpensourceContributionDto> {
    await opensourceService.getContributionById(id);

    const updateData: Prisma.OpensourceContributionUpdateInput = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.url !== undefined) updateData.url = input.url;
    if (input.role !== undefined) updateData.role = input.role || null;
    if (input.stars !== undefined) updateData.stars = input.stars ?? null;
    if (input.forks !== undefined) updateData.forks = input.forks ?? null;
    if (input.language !== undefined) updateData.language = input.language || null;
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await opensourceRepository.update(id, updateData);

    activityLogService.log({
      action: 'opensource_update',
      entityType: 'opensource_contribution',
      entityId: updated.id,
      details: { name: updated.name, role: updated.role },
    });

    return mapOpensourceToDto(updated);
  },

  async deleteContribution(id: string): Promise<void> {
    const existing = await opensourceService.getContributionById(id);
    await opensourceRepository.delete(id);

    activityLogService.log({
      action: 'opensource_delete',
      entityType: 'opensource_contribution',
      entityId: id,
      details: { name: existing.name, role: existing.role },
    });
  },

  async reorderContributions(items: { id: string; sortOrder: number }[]): Promise<void> {
    await opensourceRepository.reorder(items);
  },
};

import { experienceRepository } from '@/repositories/experience.repository';
import { mapExperienceToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { ExperienceDto, UpsertExperienceInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const experienceService = {
  async listExperiences(onlyEnabled = true): Promise<ExperienceDto[]> {
    const experiences = await experienceRepository.findAll(onlyEnabled);
    return experiences.map(mapExperienceToDto);
  },

  async getExperienceById(id: string): Promise<ExperienceDto> {
    const experience = await experienceRepository.findById(id);
    if (!experience) {
      throw new NotFoundError(`Experience '${id}' not found`);
    }
    return mapExperienceToDto(experience);
  },

  async createExperience(input: UpsertExperienceInput): Promise<ExperienceDto> {
    const created = await experienceRepository.create({
      companyName: input.companyName,
      role: input.role,
      location: input.location ?? null,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      isCurrent: input.isCurrent ?? false,
      description: input.description ?? null,
      technologies: input.technologies ?? [],
      companyUrl: input.companyUrl ?? null,
      companyLogoId: input.companyLogoId ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });
    return mapExperienceToDto(created);
  },

  async updateExperience(id: string, input: Partial<UpsertExperienceInput>): Promise<ExperienceDto> {
    await experienceService.getExperienceById(id);

    const updateData: Prisma.ExperienceUncheckedUpdateInput = {};
    if (input.companyName !== undefined) updateData.companyName = input.companyName;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.location !== undefined) updateData.location = input.location || null;
    if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) updateData.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.isCurrent !== undefined) updateData.isCurrent = input.isCurrent;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.technologies !== undefined) updateData.technologies = input.technologies;
    if (input.companyUrl !== undefined) updateData.companyUrl = input.companyUrl || null;
    if (input.companyLogoId !== undefined) updateData.companyLogoId = input.companyLogoId || null;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await experienceRepository.update(id, updateData);
    return mapExperienceToDto(updated);
  },

  async deleteExperience(id: string): Promise<void> {
    await experienceService.getExperienceById(id);
    await experienceRepository.delete(id);
  },

  async reorderExperiences(items: { id: string; sortOrder: number }[]): Promise<void> {
    await experienceRepository.reorder(items);
  },
};

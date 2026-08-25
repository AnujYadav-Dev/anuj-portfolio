import { educationRepository } from '@/repositories/education.repository';
import { mapEducationToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { EducationDto, UpsertEducationInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const educationService = {
  async listEducation(onlyEnabled = true): Promise<EducationDto[]> {
    const records = await educationRepository.findAll(onlyEnabled);
    return records.map(mapEducationToDto);
  },

  async getEducationById(id: string): Promise<EducationDto> {
    const record = await educationRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`Education record '${id}' not found`);
    }
    return mapEducationToDto(record);
  },

  async createEducation(input: UpsertEducationInput): Promise<EducationDto> {
    const created = await educationRepository.create({
      institution: input.institution,
      degree: input.degree,
      fieldOfStudy: input.fieldOfStudy ?? null,
      location: input.location ?? null,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      isCurrent: input.isCurrent ?? false,
      grade: input.grade ?? null,
      description: input.description ?? null,
      activities: input.activities ?? null,
      institutionLogoId: input.institutionLogoId ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });
    return mapEducationToDto(created);
  },

  async updateEducation(id: string, input: Partial<UpsertEducationInput>): Promise<EducationDto> {
    await educationService.getEducationById(id);

    const updateData: Prisma.EducationUncheckedUpdateInput = {};
    if (input.institution !== undefined) updateData.institution = input.institution;
    if (input.degree !== undefined) updateData.degree = input.degree;
    if (input.fieldOfStudy !== undefined) updateData.fieldOfStudy = input.fieldOfStudy || null;
    if (input.location !== undefined) updateData.location = input.location || null;
    if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
    if (input.endDate !== undefined)
      updateData.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.isCurrent !== undefined) updateData.isCurrent = input.isCurrent;
    if (input.grade !== undefined) updateData.grade = input.grade || null;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.activities !== undefined) updateData.activities = input.activities || null;
    if (input.institutionLogoId !== undefined)
      updateData.institutionLogoId = input.institutionLogoId || null;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await educationRepository.update(id, updateData);
    return mapEducationToDto(updated);
  },

  async deleteEducation(id: string): Promise<void> {
    await educationService.getEducationById(id);
    await educationRepository.delete(id);
  },

  async reorderEducation(items: { id: string; sortOrder: number }[]): Promise<void> {
    await educationRepository.reorder(items);
  },
};

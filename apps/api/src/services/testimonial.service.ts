import { testimonialRepository } from '@/repositories/testimonial.repository';
import { mapTestimonialToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { TestimonialDto, UpsertTestimonialInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const testimonialService = {
  async listTestimonials(onlyEnabled = true, isFeatured?: boolean): Promise<TestimonialDto[]> {
    const records = await testimonialRepository.findAll(onlyEnabled, isFeatured);
    return records.map(mapTestimonialToDto);
  },

  async getTestimonialById(id: string): Promise<TestimonialDto> {
    const record = await testimonialRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`Testimonial '${id}' not found`);
    }
    return mapTestimonialToDto(record);
  },

  async createTestimonial(input: UpsertTestimonialInput): Promise<TestimonialDto> {
    const created = await testimonialRepository.create({
      authorName: input.authorName,
      authorTitle: input.authorTitle ?? null,
      authorCompany: input.authorCompany ?? null,
      authorAvatarId: input.authorAvatarId ?? null,
      content: input.content,
      url: input.url ?? null,
      isFeatured: input.isFeatured ?? false,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });
    return mapTestimonialToDto(created);
  },

  async updateTestimonial(
    id: string,
    input: Partial<UpsertTestimonialInput>,
  ): Promise<TestimonialDto> {
    await testimonialService.getTestimonialById(id);

    const updateData: Prisma.TestimonialUncheckedUpdateInput = {};
    if (input.authorName !== undefined) updateData.authorName = input.authorName;
    if (input.authorTitle !== undefined) updateData.authorTitle = input.authorTitle || null;
    if (input.authorCompany !== undefined) updateData.authorCompany = input.authorCompany || null;
    if (input.authorAvatarId !== undefined)
      updateData.authorAvatarId = input.authorAvatarId || null;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.url !== undefined) updateData.url = input.url || null;
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await testimonialRepository.update(id, updateData);
    return mapTestimonialToDto(updated);
  },

  async deleteTestimonial(id: string): Promise<void> {
    await testimonialService.getTestimonialById(id);
    await testimonialRepository.delete(id);
  },

  async reorderTestimonials(items: { id: string; sortOrder: number }[]): Promise<void> {
    await testimonialRepository.reorder(items);
  },
};

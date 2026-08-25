import { timelineRepository } from '@/repositories/timeline.repository';
import { mapTimelineEventToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { TimelineEventDto, UpsertTimelineEventInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const timelineService = {
  async listEvents(onlyEnabled = true, eventType?: any): Promise<TimelineEventDto[]> {
    const records = await timelineRepository.findAll(onlyEnabled, eventType);
    return records.map(mapTimelineEventToDto);
  },

  async getEventById(id: string): Promise<TimelineEventDto> {
    const record = await timelineRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`Timeline event '${id}' not found`);
    }
    return mapTimelineEventToDto(record);
  },

  async createEvent(input: UpsertTimelineEventInput): Promise<TimelineEventDto> {
    const created = await timelineRepository.create({
      title: input.title,
      description: input.description ?? null,
      eventType: input.eventType as any,
      date: new Date(input.date),
      endDate: input.endDate ? new Date(input.endDate) : null,
      icon: input.icon ?? null,
      url: input.url ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });
    return mapTimelineEventToDto(created);
  },

  async updateEvent(
    id: string,
    input: Partial<UpsertTimelineEventInput>,
  ): Promise<TimelineEventDto> {
    await timelineService.getEventById(id);

    const updateData: Prisma.TimelineEventUpdateInput = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.eventType !== undefined) updateData.eventType = input.eventType as any;
    if (input.date !== undefined) updateData.date = new Date(input.date);
    if (input.endDate !== undefined)
      updateData.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.icon !== undefined) updateData.icon = input.icon || null;
    if (input.url !== undefined) updateData.url = input.url || null;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await timelineRepository.update(id, updateData);
    return mapTimelineEventToDto(updated);
  },

  async deleteEvent(id: string): Promise<void> {
    await timelineService.getEventById(id);
    await timelineRepository.delete(id);
  },

  async reorderEvents(items: { id: string; sortOrder: number }[]): Promise<void> {
    await timelineRepository.reorder(items);
  },
};

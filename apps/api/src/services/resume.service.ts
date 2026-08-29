import { resumeRepository } from '@/repositories/resume.repository';
import { activityLogService } from '@/services/activityLog.service';
import { mapResumeToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { CreateResumeInput, ResumeDto } from '@portfolio/shared';

export const resumeService = {
  async getActiveResume(): Promise<ResumeDto> {
    const resume = await resumeRepository.findActive();
    if (!resume) {
      throw new NotFoundError('No active resume found');
    }
    return mapResumeToDto(resume);
  },

  async listAllResumes(): Promise<ResumeDto[]> {
    const resumes = await resumeRepository.findAll();
    return resumes.map(mapResumeToDto);
  },

  async getResumeById(id: string): Promise<ResumeDto> {
    const resume = await resumeRepository.findById(id);
    if (!resume) {
      throw new NotFoundError(`Resume '${id}' not found`);
    }
    return mapResumeToDto(resume);
  },

  async createResume(input: CreateResumeInput): Promise<ResumeDto> {
    const created = await resumeRepository.create({
      title: input.title,
      versionLabel: input.versionLabel ?? null,
      fileId: input.fileId,
      isActive: input.isActive ?? false,
    });

    activityLogService.log({
      action: 'resume_create',
      entityType: 'resume',
      entityId: created.id,
      details: { title: created.title, versionLabel: created.versionLabel, isActive: created.isActive },
    });

    if (input.isActive) {
      const active = await resumeRepository.setActive(created.id);
      return mapResumeToDto(active);
    }

    return mapResumeToDto(created);
  },

  async setActiveResume(id: string): Promise<ResumeDto> {
    const existing = await resumeService.getResumeById(id);
    const updated = await resumeRepository.setActive(id);

    activityLogService.log({
      action: 'resume_set_active',
      entityType: 'resume',
      entityId: id,
      details: { title: existing.title, versionLabel: existing.versionLabel },
    });

    return mapResumeToDto(updated);
  },

  async deleteResume(id: string): Promise<void> {
    const existing = await resumeService.getResumeById(id);
    await resumeRepository.delete(id);

    activityLogService.log({
      action: 'resume_delete',
      entityType: 'resume',
      entityId: id,
      details: { title: existing.title, versionLabel: existing.versionLabel },
    });
  },
};

import { resumeRepository } from '@/repositories/resume.repository';
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

    if (input.isActive) {
      const active = await resumeRepository.setActive(created.id);
      return mapResumeToDto(active);
    }

    return mapResumeToDto(created);
  },

  async setActiveResume(id: string): Promise<ResumeDto> {
    await resumeService.getResumeById(id);
    const updated = await resumeRepository.setActive(id);
    return mapResumeToDto(updated);
  },

  async deleteResume(id: string): Promise<void> {
    await resumeService.getResumeById(id);
    await resumeRepository.delete(id);
  },
};

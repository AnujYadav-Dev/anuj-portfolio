import type { Request, Response } from 'express';
import { resumeService } from '@/services/resume.service';
import type { CreateResumeInput } from '@portfolio/shared';

export const resumeController = {
  async getActive(_req: Request, res: Response): Promise<void> {
    const resume = await resumeService.getActiveResume();
    res.json({ data: resume });
  },

  async downloadActive(_req: Request, res: Response): Promise<void> {
    const resume = await resumeService.getActiveResume();
    res.redirect(resume.fileUrl);
  },

  async listAll(_req: Request, res: Response): Promise<void> {
    const resumes = await resumeService.listAllResumes();
    res.json({ data: resumes });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const resume = await resumeService.getResumeById(id);
    res.json({ data: resume });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreateResumeInput;
    const resume = await resumeService.createResume(input);
    res.status(201).json({ data: resume });
  },

  async setActive(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const resume = await resumeService.setActiveResume(id);
    res.json({ data: resume });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await resumeService.deleteResume(id);
    res.status(204).send();
  },
};

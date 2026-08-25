import type { Request, Response } from 'express';
import { testimonialService } from '@/services/testimonial.service';
import type { ReorderInput, UpsertTestimonialInput } from '@portfolio/shared';

export const testimonialController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const isFeatured =
      req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined;
    const records = await testimonialService.listTestimonials(true, isFeatured);
    res.json({ data: records });
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const isFeatured =
      req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined;
    const records = await testimonialService.listTestimonials(false, isFeatured);
    res.json({ data: records });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const record = await testimonialService.getTestimonialById(id);
    res.json({ data: record });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertTestimonialInput;
    const record = await testimonialService.createTestimonial(input);
    res.status(201).json({ data: record });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertTestimonialInput>;
    const record = await testimonialService.updateTestimonial(id, input);
    res.json({ data: record });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await testimonialService.deleteTestimonial(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await testimonialService.reorderTestimonials(items);
    res.json({ data: { success: true } });
  },
};

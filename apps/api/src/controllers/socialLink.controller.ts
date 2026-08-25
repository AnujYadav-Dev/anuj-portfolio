import type { Request, Response } from 'express';
import { socialLinkService } from '@/services/socialLink.service';
import type { ReorderInput, UpsertSocialLinkInput } from '@portfolio/shared';

export const socialLinkController = {
  async listPublic(_req: Request, res: Response): Promise<void> {
    const links = await socialLinkService.listSocialLinks(true);
    res.json({ data: links });
  },

  async listAdmin(_req: Request, res: Response): Promise<void> {
    const links = await socialLinkService.listSocialLinks(false);
    res.json({ data: links });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const link = await socialLinkService.getSocialLinkById(id);
    res.json({ data: link });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertSocialLinkInput;
    const link = await socialLinkService.createSocialLink(input);
    res.status(201).json({ data: link });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertSocialLinkInput>;
    const link = await socialLinkService.updateSocialLink(id, input);
    res.json({ data: link });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await socialLinkService.deleteSocialLink(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await socialLinkService.reorderSocialLinks(items);
    res.json({ data: { success: true } });
  },
};

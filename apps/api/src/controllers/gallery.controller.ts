import type { Request, Response } from 'express';
import { galleryService } from '@/services/gallery.service';
import type { ReorderInput, UpsertGalleryItemInput } from '@portfolio/shared';

export const galleryController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const category = req.query.category ? String(req.query.category) : undefined;
    const items = await galleryService.listItems(true, category);
    res.json({ data: items });
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const category = req.query.category ? String(req.query.category) : undefined;
    const items = await galleryService.listItems(false, category);
    res.json({ data: items });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const item = await galleryService.getItemById(id);
    res.json({ data: item });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertGalleryItemInput;
    const item = await galleryService.createItem(input);
    res.status(201).json({ data: item });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertGalleryItemInput>;
    const item = await galleryService.updateItem(id, input);
    res.json({ data: item });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await galleryService.deleteItem(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await galleryService.reorderItems(items);
    res.json({ data: { success: true } });
  },
};

import type { Request, Response } from 'express';
import type { UploadMediaMetadataInput, ListMediaInput, UpdateMediaInput } from '@portfolio/shared';
import { uploadMediaMetadataSchema } from '@portfolio/shared';
import { mediaService } from '@/services/media.service';
import { ValidationError } from '@/utils/errors';

export const mediaController = {
  async upload(req: Request, res: Response): Promise<void> {
    if (!req.author) {
      throw new ValidationError('Authentication required');
    }

    const file = req.file;

    if (!file) {
      throw new ValidationError('No file uploaded', {
        file: ['A file is required'],
      });
    }

    const metadataResult = uploadMediaMetadataSchema.safeParse({
      altText: req.body.altText,
      caption: req.body.caption,
    });

    if (!metadataResult.success) {
      throw new ValidationError('Invalid metadata', {
        altText: metadataResult.error.flatten().fieldErrors.altText,
        caption: metadataResult.error.flatten().fieldErrors.caption,
      } as Record<string, string[]>);
    }

    const metadata = metadataResult.data as UploadMediaMetadataInput;
    const result = await mediaService.upload(
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      metadata,
      req.author.id,
    );

    res.status(201).json({ data: result });
  },

  async list(req: Request, res: Response): Promise<void> {
    const query = req.validatedQuery as ListMediaInput;
    const result = await mediaService.list(query);
    res.status(200).json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await mediaService.getById(id);
    res.status(200).json({ data: result });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const input = req.validatedBody as UpdateMediaInput;
    const result = await mediaService.update(id, input);
    res.status(200).json({ data: result });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    await mediaService.delete(id);
    res.status(204).send();
  },
};

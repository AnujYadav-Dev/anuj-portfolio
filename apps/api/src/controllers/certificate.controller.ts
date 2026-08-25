import type { Request, Response } from 'express';
import { certificateService } from '@/services/certificate.service';
import type { ReorderInput, UpsertCertificateInput } from '@portfolio/shared';

export const certificateController = {
  async listPublic(_req: Request, res: Response): Promise<void> {
    const records = await certificateService.listCertificates(true);
    res.json({ data: records });
  },

  async listAdmin(_req: Request, res: Response): Promise<void> {
    const records = await certificateService.listCertificates(false);
    res.json({ data: records });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const record = await certificateService.getCertificateById(id);
    res.json({ data: record });
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpsertCertificateInput;
    const record = await certificateService.createCertificate(input);
    res.status(201).json({ data: record });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const input = req.validatedBody as Partial<UpsertCertificateInput>;
    const record = await certificateService.updateCertificate(id, input);
    res.json({ data: record });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await certificateService.deleteCertificate(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { items } = req.validatedBody as ReorderInput;
    await certificateService.reorderCertificates(items);
    res.json({ data: { success: true } });
  },
};

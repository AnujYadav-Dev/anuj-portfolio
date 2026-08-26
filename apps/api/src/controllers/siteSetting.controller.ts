import type { Request, Response } from 'express';
import { siteSettingService } from '@/services/siteSetting.service';
import type { UpdateSiteSettingInput } from '@portfolio/shared';

export const siteSettingController = {
  async getPublicSettings(_req: Request, res: Response): Promise<void> {
    const settingsMap = await siteSettingService.getPublicSettingsMap();
    res.json({ data: settingsMap });
  },

  async listAll(_req: Request, res: Response): Promise<void> {
    const settings = await siteSettingService.getAllSettings();
    res.json({ data: settings });
  },

  async getByKey(req: Request, res: Response): Promise<void> {
    const key = String(req.params.key);
    const setting = await siteSettingService.getSettingByKey(key);
    res.json({ data: setting });
  },

  async update(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as UpdateSiteSettingInput;
    const setting = await siteSettingService.updateSetting(input);
    res.json({ data: setting });
  },

  async updateBulk(req: Request, res: Response): Promise<void> {
    const raw = req.body;
    const settings: UpdateSiteSettingInput[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.settings)
        ? raw.settings
        : [];
    const updated = await siteSettingService.updateManySettings(settings);
    res.json({ data: updated });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const key = String(req.params.key);
    await siteSettingService.deleteSetting(key);
    res.status(204).send();
  },
};

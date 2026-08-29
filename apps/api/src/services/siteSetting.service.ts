import { siteSettingRepository } from '@/repositories/siteSetting.repository';
import { activityLogService } from '@/services/activityLog.service';
import { mapSiteSettingToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { SiteSettingDto, UpdateSiteSettingInput } from '@portfolio/shared';

export const siteSettingService = {
  async getAllSettings(): Promise<SiteSettingDto[]> {
    const settings = await siteSettingRepository.findAll();
    return settings.map(mapSiteSettingToDto);
  },

  async getPublicSettingsMap(): Promise<Record<string, string>> {
    const settings = await siteSettingRepository.findAll();
    const map: Record<string, string> = {};
    for (const setting of settings) {
      map[setting.key] = setting.value;
    }
    return map;
  },

  async getSettingByKey(key: string): Promise<SiteSettingDto> {
    const setting = await siteSettingRepository.findByKey(key);
    if (!setting) {
      throw new NotFoundError(`Site setting '${key}' not found`);
    }
    return mapSiteSettingToDto(setting);
  },

  async updateSetting(input: UpdateSiteSettingInput): Promise<SiteSettingDto> {
    const updated = await siteSettingRepository.upsert(input.key, input.value, input.group);
    setImmediate(() => {
      activityLogService.log({
        action: 'settings.update',
        entityType: 'SiteSetting',
        entityId: input.key,
        details: { key: input.key, value: input.value },
      });
    });
    return mapSiteSettingToDto(updated);
  },

  async updateManySettings(settings: UpdateSiteSettingInput[]): Promise<SiteSettingDto[]> {
    const updated = await siteSettingRepository.upsertMany(settings);
    setImmediate(() => {
      activityLogService.log({
        action: 'settings.bulk_update',
        entityType: 'SiteSetting',
        details: { count: settings.length, keys: settings.map((s) => s.key) },
      });
    });
    return updated.map(mapSiteSettingToDto);
  },

  async deleteSetting(key: string): Promise<void> {
    await siteSettingService.getSettingByKey(key);
    await siteSettingRepository.delete(key);
    setImmediate(() => {
      activityLogService.log({
        action: 'settings.delete',
        entityType: 'SiteSetting',
        entityId: key,
        details: { key },
      });
    });
  },
};

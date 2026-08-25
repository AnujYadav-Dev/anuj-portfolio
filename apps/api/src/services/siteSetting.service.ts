import { siteSettingRepository } from '@/repositories/siteSetting.repository';
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
    return mapSiteSettingToDto(updated);
  },

  async updateManySettings(settings: UpdateSiteSettingInput[]): Promise<SiteSettingDto[]> {
    const updated = await siteSettingRepository.upsertMany(settings);
    return updated.map(mapSiteSettingToDto);
  },

  async deleteSetting(key: string): Promise<void> {
    await siteSettingService.getSettingByKey(key);
    await siteSettingRepository.delete(key);
  },
};

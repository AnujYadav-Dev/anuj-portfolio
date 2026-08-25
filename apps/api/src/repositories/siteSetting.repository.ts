import { prisma } from '@/config/prisma';
import { SITE_SETTING_KEYS } from '@portfolio/shared';

export const siteSettingRepository = {
  async getValue(key: string): Promise<string | null> {
    const setting = await prisma.siteSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  },

  async isAnalyticsEnabled(): Promise<boolean> {
    const value = await this.getValue(SITE_SETTING_KEYS.ANALYTICS_ENABLED);
    return value === 'true';
  },
};

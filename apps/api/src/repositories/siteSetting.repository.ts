import { prisma } from '@/config/prisma';
import { SITE_SETTING_KEYS } from '@portfolio/shared';

export const siteSettingRepository = {
  async findAll() {
    return prisma.siteSetting.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  },

  async findByKey(key: string) {
    return prisma.siteSetting.findUnique({ where: { key } });
  },

  async getValue(key: string): Promise<string | null> {
    const setting = await prisma.siteSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  },

  async isAnalyticsEnabled(): Promise<boolean> {
    const value = await this.getValue(SITE_SETTING_KEYS.ANALYTICS_ENABLED);
    return value === 'true';
  },

  async upsert(key: string, value: string, group = 'general') {
    return prisma.siteSetting.upsert({
      where: { key },
      create: { key, value, group },
      update: { value, group },
    });
  },

  async upsertMany(settings: { key: string; value: string; group?: string }[]) {
    return prisma.$transaction(
      settings.map((s) =>
        prisma.siteSetting.upsert({
          where: { key: s.key },
          create: { key: s.key, value: s.value, group: s.group ?? 'general' },
          update: { value: s.value, group: s.group ?? 'general' },
        }),
      ),
    );
  },

  async delete(key: string) {
    return prisma.siteSetting.delete({ where: { key } });
  },
};

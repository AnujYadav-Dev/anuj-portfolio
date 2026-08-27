import { prisma } from '@/config/prisma';
import { SITE_SETTING_KEYS, DEFAULT_SYSTEM_SITE_SETTINGS } from '@portfolio/shared';

export const siteSettingRepository = {
  /** Ensure all default system site settings are present in database without overriding user values. */
  async ensureDefaultSettings() {
    try {
      const existing = await prisma.siteSetting.findMany({ select: { key: true } });
      const existingKeys = new Set(existing.map((s) => s.key));
      const missing = DEFAULT_SYSTEM_SITE_SETTINGS.filter((s) => !existingKeys.has(s.key));

      if (missing.length > 0) {
        await prisma.$transaction(
          missing.map((s) =>
            prisma.siteSetting.upsert({
              where: { key: s.key },
              create: { key: s.key, value: s.value, group: s.group },
              update: {},
            }),
          ),
        );
      }
    } catch {
      // In case table is still migrating or testing, avoid crashing
    }
  },

  async findAll() {
    await this.ensureDefaultSettings();
    return prisma.siteSetting.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  },

  async findByKey(key: string) {
    const found = await prisma.siteSetting.findUnique({ where: { key } });
    if (found) return found;

    // Fallback to default definition if defined
    const def = DEFAULT_SYSTEM_SITE_SETTINGS.find((s) => s.key === key);
    if (def) {
      try {
        return await prisma.siteSetting.upsert({
          where: { key: def.key },
          create: { key: def.key, value: def.value, group: def.group },
          update: {},
        });
      } catch {
        return {
          id: 'temp-' + def.key,
          key: def.key,
          value: def.value,
          group: def.group,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }
    return null;
  },

  async getValue(key: string): Promise<string | null> {
    const setting = await this.findByKey(key);
    return setting?.value ?? null;
  },

  async isAnalyticsEnabled(): Promise<boolean> {
    const value = await this.getValue(SITE_SETTING_KEYS.ANALYTICS_ENABLED);
    return value === 'true';
  },

  async upsert(key: string, value: string, group?: string) {
    return prisma.siteSetting.upsert({
      where: { key },
      create: { key, value, group: group ?? 'general' },
      update: group !== undefined ? { value, group } : { value },
    });
  },

  async upsertMany(settings: { key: string; value: string; group?: string }[]) {
    return prisma.$transaction(
      settings.map((s) =>
        prisma.siteSetting.upsert({
          where: { key: s.key },
          create: { key: s.key, value: s.value, group: s.group ?? 'general' },
          update: s.group !== undefined ? { value: s.value, group: s.group } : { value: s.value },
        }),
      ),
    );
  },

  async delete(key: string) {
    return prisma.siteSetting.delete({ where: { key } });
  },
};

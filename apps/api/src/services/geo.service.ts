import { Prisma } from '@prisma/client';
import { GEO_CACHE_TTL_MS, GEO_LOOKUP_TIMEOUT_MS } from '@/config/constants';
import { logger } from '@/config/logger';

export interface GeoLocation {
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
}

interface GeoCacheEntry {
  data: GeoLocation;
  expiresAt: number;
}

const geoCache = new Map<string, GeoCacheEntry>();

const EMPTY_GEO: GeoLocation = {
  country: null,
  region: null,
  city: null,
  latitude: null,
  longitude: null,
};

function isPrivateIp(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

export const geoService = {
  async lookup(ip: string): Promise<GeoLocation> {
    if (isPrivateIp(ip)) {
      return EMPTY_GEO;
    }

    const cached = geoCache.get(ip);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), GEO_LOOKUP_TIMEOUT_MS);

      const response = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,lat,lon`,
        { signal: controller.signal },
      );

      clearTimeout(timeout);

      if (!response.ok) {
        return EMPTY_GEO;
      }

      const data = (await response.json()) as {
        status: string;
        country?: string;
        regionName?: string;
        city?: string;
        lat?: number;
        lon?: number;
      };

      if (data.status !== 'success') {
        return EMPTY_GEO;
      }

      const result: GeoLocation = {
        country: data.country ?? null,
        region: data.regionName ?? null,
        city: data.city ?? null,
        latitude: data.lat != null ? new Prisma.Decimal(data.lat) : null,
        longitude: data.lon != null ? new Prisma.Decimal(data.lon) : null,
      };

      geoCache.set(ip, {
        data: result,
        expiresAt: Date.now() + GEO_CACHE_TTL_MS,
      });

      return result;
    } catch (error) {
      logger.warn({ err: error, ip }, 'Geo lookup failed');
      return EMPTY_GEO;
    }
  },
};

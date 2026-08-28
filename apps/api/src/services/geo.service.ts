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
  async lookup(ip: string, headers?: Record<string, string | string[] | undefined>): Promise<GeoLocation> {
    // 1. Check for CDN geo headers (Cloudflare, etc.)
    if (headers) {
      const cfCountry = headers['cf-ipcountry'];
      const cfCity = headers['cf-ipcity'];
      const cfRegion = headers['cf-region'] || headers['cf-region-code'];

      if (typeof cfCountry === 'string' && cfCountry.trim().length > 0 && cfCountry !== 'XX' && cfCountry !== 'T1') {
        return {
          country: cfCountry.trim().toUpperCase(),
          region: typeof cfRegion === 'string' ? cfRegion.trim() : null,
          city: typeof cfCity === 'string' ? decodeURIComponent(cfCity.trim()) : null,
          latitude: null,
          longitude: null,
        };
      }
    }

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

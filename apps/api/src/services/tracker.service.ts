import type {
  RegisterSessionInput,
  RecordViewInput,
  RecordClickInput,
  ClickTargetType,
} from '@portfolio/shared';
import { visitorRepository } from '@/repositories/visitor.repository';
import { siteSettingRepository } from '@/repositories/siteSetting.repository';
import { geoService } from '@/services/geo.service';
import { parseUserAgent } from '@/utils/uaParser';
import { parseReferrerSource, normalizeIpForDb } from '@/utils/ip';
import {
  mapVisitorToDto,
  mapPageViewToDto,
  mapLinkClickToDto,
} from '@/utils/mappers';
import { ValidationError } from '@/utils/errors';

export const trackerService = {
  async isEnabled(): Promise<boolean> {
    return siteSettingRepository.isAnalyticsEnabled();
  },

  async registerSession(
    input: RegisterSessionInput,
    context: { ip: string; userAgent: string | undefined },
  ) {
    const existing = await visitorRepository.findBySessionId(input.sessionId);

    if (existing) {
      const updated = await visitorRepository.updateLastVisit(existing.id);
      return mapVisitorToDto(updated);
    }

    const parsedUa = parseUserAgent(context.userAgent ?? input.userAgent);
    const geo = await geoService.lookup(context.ip);
    const referrer = input.referrer ?? null;

    const visitor = await visitorRepository.create({
      sessionId: input.sessionId,
      ipAddress: normalizeIpForDb(context.ip),
      userAgent: context.userAgent ?? input.userAgent ?? null,
      browser: parsedUa.browser,
      browserVersion: parsedUa.browserVersion,
      os: parsedUa.os,
      osVersion: parsedUa.osVersion,
      deviceType: parsedUa.deviceType,
      screenWidth: input.screenWidth ?? null,
      screenHeight: input.screenHeight ?? null,
      language: input.language ?? null,
      timezone: input.timezone ?? null,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      referrer,
      referrerSource: parseReferrerSource(referrer ?? undefined),
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
    });

    return mapVisitorToDto(visitor);
  },

  async recordView(input: RecordViewInput) {
    const visitor = await visitorRepository.findBySessionId(input.sessionId);

    if (!visitor) {
      throw new ValidationError('Visitor session not found. Register a session first.', {
        sessionId: ['Unknown session ID — call POST /analytics/session first'],
      });
    }

    const pageView = await visitorRepository.createPageView({
      visitorId: visitor.id,
      path: input.path,
      title: input.title ?? null,
      referrer: input.referrer ?? null,
      durationSeconds: input.durationSeconds ?? null,
    });

    return mapPageViewToDto(pageView);
  },

  async recordClick(input: RecordClickInput) {
    let visitorId: string | null = null;

    if (input.sessionId) {
      const visitor = await visitorRepository.findBySessionId(input.sessionId);
      visitorId = visitor?.id ?? null;
    }

    const linkClick = await visitorRepository.createLinkClick({
      visitorId,
      targetType: input.targetType as ClickTargetType,
      targetUrl: input.targetUrl,
      sourcePath: input.sourcePath ?? null,
    });

    return mapLinkClickToDto(linkClick);
  },
};

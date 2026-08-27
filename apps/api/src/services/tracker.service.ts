import type {
  RegisterSessionInput,
  RecordViewInput,
  RecordClickInput,
  ClickTargetType,
  AnalyticsPeriod,
  AdminAnalyticsOverviewDto,
  AnalyticsTimeSeriesPoint,
  AdminTopPageItem,
  AdminVisitorLogItem,
  AdminClickItem,
  BreakdownItem,
} from '@portfolio/shared';
import { EMAIL_TEMPLATE_KEYS } from '@portfolio/shared';
import { visitorRepository } from '@/repositories/visitor.repository';
import { siteSettingRepository } from '@/repositories/siteSetting.repository';
import { geoService } from '@/services/geo.service';
import { parseUserAgent } from '@/utils/uaParser';
import { parseReferrerSource, normalizeIpForDb } from '@/utils/ip';
import { mapVisitorToDto, mapPageViewToDto, mapLinkClickToDto } from '@/utils/mappers';
import { ValidationError } from '@/utils/errors';
import { getPrismaPagination, buildPagination } from '@/utils/pagination';

function getSinceDate(period?: AnalyticsPeriod): Date | undefined {
  if (!period || period === 'all') return undefined;
  const now = Date.now();
  switch (period) {
    case '24h':
      return new Date(now - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case '14d':
      return new Date(now - 14 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
}

function calculateBreakdowns(
  items: Array<{ [key: string]: any; _count: { id: number } }>,
  keyName: string,
  totalCount: number,
): BreakdownItem[] {
  return items.map((item) => {
    const rawVal = item[keyName];
    const name = rawVal ? String(rawVal) : 'Unknown / Direct';
    const count = item._count.id;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0;
    return { name, count, percentage };
  });
}

import { emailService } from '@/services/email.service';
import { logger } from '@/config/logger';

// In-memory cooldown tracking (IP -> last timestamp ms) to prevent excessive notification spam
const visitNotificationCooldown = new Map<string, number>();
const resumeDownloadCooldown = new Map<string, number>();

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

    const parsedUa = parseUserAgent(context.userAgent ?? (input.userAgent || undefined));

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

    // Trigger Visit Notification (Asynchronous, Non-blocking, Rate-limited)
    setImmediate(async () => {
      try {
        const visitEnabledSetting = await siteSettingRepository.findByKey(
          'email_notifications_visit_enabled',
        );
        if (visitEnabledSetting?.value !== 'true') return;

        // Skip bot crawlers
        if (parsedUa.deviceType === 'bot' || parsedUa.browser?.toLowerCase().includes('bot')) {
          return;
        }

        const cooldownMinutesSetting = await siteSettingRepository.findByKey(
          'email_notifications_visit_cooldown_minutes',
        );
        const cooldownMs = (parseInt(cooldownMinutesSetting?.value || '60', 10) || 60) * 60 * 1000;
        const now = Date.now();
        const lastSent = visitNotificationCooldown.get(context.ip) || 0;

        if (now - lastSent < cooldownMs) {
          return;
        }

        visitNotificationCooldown.set(context.ip, now);
        const siteUrl = await emailService.resolveSiteUrl();
        const adminRecipients = await emailService.resolveAdminRecipients();

        for (const adminEmail of adminRecipients) {
          await emailService.sendTemplatedEmail({
            purpose: EMAIL_TEMPLATE_KEYS.VISIT_ADMIN_NOTIFICATION,
            to: adminEmail,
            variables: {
              ipAddress: context.ip,
              country: geo.country || 'Unknown',
              city: geo.city || 'Unknown',
              deviceType: parsedUa.deviceType || 'Desktop',
              browser: parsedUa.browser || 'Unknown',
              os: parsedUa.os || 'Unknown',
              referrerSource: parseReferrerSource(referrer ?? undefined) || 'Direct',
              visitedAt: new Date().toLocaleString(),
              siteUrl,
            },
          });
        }
      } catch (err) {
        logger.error({ err }, 'Error sending visit notification email');
      }
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
    let visitor = null;

    if (input.sessionId) {
      visitor = await visitorRepository.findBySessionId(input.sessionId);
      visitorId = visitor?.id ?? null;
    }

    const linkClick = await visitorRepository.createLinkClick({
      visitorId,
      targetType: input.targetType as ClickTargetType,
      targetUrl: input.targetUrl,
      sourcePath: input.sourcePath ?? null,
    });

    // Trigger Resume Download Recruiter Alert
    if (input.targetType === 'resume_download') {
      setImmediate(async () => {
        try {
          const setting = await siteSettingRepository.findByKey(
            'email_notifications_resume_download_enabled',
          );
          if (setting && setting.value === 'false') return;

          const ip = visitor?.ipAddress || 'unknown';
          const now = Date.now();
          const lastSent = resumeDownloadCooldown.get(ip) || 0;
          if (now - lastSent < 15 * 60 * 1000) return; // 15 min cooldown per IP

          resumeDownloadCooldown.set(ip, now);
          const siteUrl = await emailService.resolveSiteUrl();
          const adminRecipients = await emailService.resolveAdminRecipients();

          for (const adminEmail of adminRecipients) {
            await emailService.sendTemplatedEmail({
              purpose: EMAIL_TEMPLATE_KEYS.RESUME_DOWNLOAD_ADMIN,
              to: adminEmail,
              variables: {
                resumeTitle: 'Latest Active Resume',
                ipAddress: ip,
                country: visitor?.country || 'Unknown',
                city: visitor?.city || 'Unknown',
                referrerSource: visitor?.referrerSource || 'Direct / Portfolio',
                downloadedAt: new Date().toLocaleString(),
                siteUrl,
              },
            });
          }
        } catch (err) {
          logger.error({ err }, 'Error sending resume download alert email');
        }
      });
    }

    return mapLinkClickToDto(linkClick);
  },

  // ──────────────────────────────────────────────
  // Admin Telemetry Services
  // ──────────────────────────────────────────────

  async getAdminOverview(period?: AnalyticsPeriod): Promise<AdminAnalyticsOverviewDto> {
    const sinceDate = getSinceDate(period);
    const raw = await visitorRepository.getOverviewStats(sinceDate);

    const totalVisitors = raw.uniqueVisitors;
    const topCountries = calculateBreakdowns(raw.topCountries, 'country', totalVisitors);
    const topReferrers = calculateBreakdowns(raw.topReferrers, 'referrerSource', totalVisitors);
    const deviceBreakdown = calculateBreakdowns(raw.deviceBreakdown, 'deviceType', totalVisitors);
    const browserBreakdown = calculateBreakdowns(raw.browserBreakdown, 'browser', totalVisitors);
    const osBreakdown = calculateBreakdowns(raw.osBreakdown, 'os', totalVisitors);

    // Approximate bounce rate: single-view visitors
    const bounceRatePercent =
      totalVisitors > 0
        ? Math.min(
            100,
            Math.round(
              ((totalVisitors - Math.floor(raw.totalPageViews / 2)) / totalVisitors) * 100,
            ),
          )
        : 0;

    return {
      totalPageViews: raw.totalPageViews,
      uniqueVisitors: raw.uniqueVisitors,
      totalSessions: raw.totalSessions,
      avgSessionDurationSeconds: raw.avgSessionDurationSeconds,
      bounceRatePercent: Math.max(0, bounceRatePercent),
      totalLinkClicks: raw.totalLinkClicks,
      topCountries,
      topReferrers,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
    };
  },

  async getAdminTimeSeries(period: AnalyticsPeriod = '30d'): Promise<AnalyticsTimeSeriesPoint[]> {
    const sinceDate = getSinceDate(period) ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [pageViews, visitors] = await Promise.all([
      visitorRepository.getRecentPageViews(sinceDate),
      visitorRepository.getRecentVisitors(sinceDate),
    ]);

    const dateMap = new Map<string, { pageViews: number; uniqueVisitors: number }>();

    // Seed continuous date range
    const days = Math.ceil((Date.now() - sinceDate.getTime()) / (24 * 60 * 60 * 1000));
    for (let i = 0; i <= days; i++) {
      const d = new Date(sinceDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0] as string;
      dateMap.set(dateStr, { pageViews: 0, uniqueVisitors: 0 });
    }

    for (const pv of pageViews) {
      const dateStr = pv.viewedAt.toISOString().split('T')[0] as string;
      const entry = dateMap.get(dateStr) || { pageViews: 0, uniqueVisitors: 0 };
      entry.pageViews += 1;
      dateMap.set(dateStr, entry);
    }

    for (const v of visitors) {
      const dateStr = v.firstVisitedAt.toISOString().split('T')[0] as string;
      const entry = dateMap.get(dateStr) || { pageViews: 0, uniqueVisitors: 0 };
      entry.uniqueVisitors += 1;
      dateMap.set(dateStr, entry);
    }

    const points: AnalyticsTimeSeriesPoint[] = [];
    for (const [date, val] of dateMap.entries()) {
      points.push({
        date,
        pageViews: val.pageViews,
        uniqueVisitors: val.uniqueVisitors,
      });
    }

    return points.sort((a, b) => a.date.localeCompare(b.date));
  },

  async getAdminTopPages(period?: AnalyticsPeriod, limit = 15): Promise<AdminTopPageItem[]> {
    const sinceDate = getSinceDate(period);
    const grouped = await visitorRepository.getTopPages(sinceDate, limit);

    return grouped.map((item) => ({
      path: item.path,
      title: item.title,
      views: item._count.id,
      uniqueVisitors: item._count.id,
      avgDurationSeconds: Math.round(item._avg.durationSeconds ?? 0),
    }));
  },

  async getAdminVisitorLogs(page = 1, pageSize = 20) {
    const { skip, take } = getPrismaPagination({ page, pageSize });
    const { visitors, total } = await visitorRepository.getVisitorLogs(skip, take);

    const items: AdminVisitorLogItem[] = visitors.map((v) => ({
      id: v.id,
      sessionId: v.sessionId,
      ipAddress: v.ipAddress,
      country: v.country,
      city: v.city,
      deviceType: v.deviceType,
      browser: v.browser,
      os: v.os,
      referrerSource: v.referrerSource,
      firstVisitedAt: v.firstVisitedAt.toISOString(),
      lastVisitedAt: v.lastVisitedAt.toISOString(),
      visitCount: v.visitCount,
      pageViewsCount: (v as any)._count?.pageViews ?? v.pageViews.length,
      recentPages: v.pageViews.map((pv) => ({
        path: pv.path,
        title: pv.title,
        viewedAt: pv.viewedAt.toISOString(),
      })),
    }));

    return {
      data: items,
      pagination: buildPagination(page, pageSize, total),
    };
  },

  async getAdminClickStats(period?: AnalyticsPeriod, limit = 20): Promise<AdminClickItem[]> {
    const sinceDate = getSinceDate(period);
    const grouped = await visitorRepository.getClickStats(sinceDate, limit);

    return grouped.map((item) => ({
      targetType: item.targetType as ClickTargetType,
      targetUrl: item.targetUrl,
      sourcePath: item.sourcePath,
      count: item._count.id,
      lastClickedAt: item._max.clickedAt
        ? item._max.clickedAt.toISOString()
        : new Date().toISOString(),
    }));
  },
};

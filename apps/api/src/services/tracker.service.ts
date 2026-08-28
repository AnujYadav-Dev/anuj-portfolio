import type {
  RegisterSessionInput,
  RecordViewInput,
  RecordClickInput,
  RecordBeaconInput,
  AnalyticsPeriod,
  AdminAnalyticsOverviewDto,
  AnalyticsTimeSeriesPoint,
  AdminTopPageItem,
  AdminVisitorLogItem,
  AdminClickItem,
  AdminLivePulseDto,
  AdminGeoMapItem,
  AdminVisitorJourneyDto,
  JourneyStep,
  BreakdownItem,
} from '@portfolio/shared';
import { ClickTargetType, EMAIL_TEMPLATE_KEYS, SITE_SETTING_KEYS } from '@portfolio/shared';
import { visitorRepository } from '@/repositories/visitor.repository';
import { siteSettingRepository } from '@/repositories/siteSetting.repository';
import { geoService } from '@/services/geo.service';
import { parseUserAgent } from '@/utils/uaParser';
import { parseReferrerSource, normalizeIpForDb } from '@/utils/ip';
import { mapVisitorToDto, mapPageViewToDto, mapLinkClickToDto } from '@/utils/mappers';
import { getPrismaPagination, buildPagination } from '@/utils/pagination';
import { emailService } from '@/services/email.service';
import { logger } from '@/config/logger';

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
  items: Array<{ [key: string]: unknown; _count: { id: number } }>,
  keyName: string,
  totalCount: number,
  fallbackLabel = 'Unknown',
): BreakdownItem[] {
  return items.map((item) => {
    const rawVal = item[keyName];
    const name = rawVal ? String(rawVal) : fallbackLabel;
    const count = item._count.id;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0;
    return { name, count, percentage };
  });
}

// In-memory cooldown tracking (IP -> last timestamp ms)
const visitNotificationCooldown = new Map<string, number>();
const resumeDownloadCooldown = new Map<string, number>();

export const trackerService = {
  async isEnabled(): Promise<boolean> {
    return siteSettingRepository.isAnalyticsEnabled();
  },

  /** Dynamic visitor intent evaluation engine. Evaluates visitor behavior to calculate intent score (0-100) and category. */
  async evaluateIntent(visitorId: string): Promise<{ score: number; category: string }> {
    try {
      const isIntentScoringEnabled =
        (await siteSettingRepository.getValue(SITE_SETTING_KEYS.ANALYTICS_INTENT_SCORING_ENABLED)) !== 'false';
      if (!isIntentScoringEnabled) {
        return { score: 0, category: 'casual' };
      }

      const journey = await visitorRepository.getVisitorJourney(visitorId);
      if (!journey) return { score: 0, category: 'casual' };

      const weightsSetting = await siteSettingRepository.getValue(SITE_SETTING_KEYS.ANALYTICS_INTENT_WEIGHTS_JSON);
      let weights = {
        resumeDownload: 40,
        contactSubmission: 50,
        worksView: 15,
        experienceView: 15,
        githubClick: 20,
        liveDemoClick: 20,
        blogResearch: 20,
        multiPage: 15,
      };

      if (weightsSetting) {
        try {
          weights = { ...weights, ...JSON.parse(weightsSetting) };
        } catch {
          // Use default weights if JSON parse fails
        }
      }

      let score = 10; // Baseline entry score

      const pageViews = journey.pageViews;
      const linkClicks = journey.linkClicks;
      const contactSubmissions = journey.contactSubmissions;

      const hasResumeDownload = linkClicks.some((c) => c.targetType === 'resume_download');
      const hasContactSubmission = contactSubmissions.length > 0;
      const hasWorksView = pageViews.some((p) => p.path.startsWith('/works'));
      const hasExperienceView = pageViews.some((p) => p.path.startsWith('/experience') || p.path.startsWith('/about'));
      const hasGithubClick = linkClicks.some((c) => c.targetType === 'github' || c.targetUrl.includes('github.com'));
      const hasLiveDemoClick = linkClicks.some((c) => c.targetType === 'live_demo');
      const hasBlogOrResearch = pageViews.some((p) => p.path.startsWith('/blogs') || p.path.startsWith('/research'));
      const highDwellTime = pageViews.some((p) => (p.durationSeconds ?? 0) >= 90 || (p.scrollDepth ?? 0) >= 75);

      if (hasResumeDownload) score += weights.resumeDownload;
      if (hasContactSubmission) score += weights.contactSubmission;
      if (hasWorksView) score += weights.worksView;
      if (hasExperienceView) score += weights.experienceView;
      if (hasGithubClick || hasLiveDemoClick) score += Math.max(weights.githubClick, weights.liveDemoClick);
      if (hasBlogOrResearch && highDwellTime) score += weights.blogResearch;
      if (pageViews.length >= 4) score += weights.multiPage;

      const finalScore = Math.min(100, score);
      let category = 'casual';

      if (hasContactSubmission) {
        category = 'lead';
      } else if (hasResumeDownload || (hasExperienceView && hasWorksView && finalScore >= 40)) {
        category = 'recruiter';
      } else if (hasGithubClick || hasLiveDemoClick || (hasWorksView && finalScore >= 35)) {
        category = 'tech_evaluator';
      } else if (hasBlogOrResearch && highDwellTime) {
        category = 'reader';
      } else {
        category = finalScore >= 30 ? 'explorer' : 'casual';
      }

      await visitorRepository.updateIntent(visitorId, finalScore, category);
      return { score: finalScore, category };
    } catch {
      return { score: 0, category: 'casual' };
    }
  },

  async registerSession(
    input: RegisterSessionInput,
    context: { ip: string; userAgent: string | undefined; headers?: Record<string, string | string[] | undefined> },
  ) {
    const existing = await visitorRepository.findBySessionId(input.sessionId);

    const parsedUa = parseUserAgent(context.userAgent ?? (input.userAgent || undefined));
    const geo = await geoService.lookup(context.ip, context.headers);
    const referrer = input.referrer ?? null;

    if (existing) {
      const updated = await visitorRepository.updateLastVisit(existing.id, {
        ipAddress: normalizeIpForDb(context.ip),
        userAgent: context.userAgent ?? input.userAgent ?? existing.userAgent,
        browser: parsedUa.browser ?? existing.browser,
        browserVersion: parsedUa.browserVersion ?? existing.browserVersion,
        os: parsedUa.os ?? existing.os,
        osVersion: parsedUa.osVersion ?? existing.osVersion,
        deviceType: parsedUa.deviceType ?? existing.deviceType,
        screenWidth: input.screenWidth ?? existing.screenWidth,
        screenHeight: input.screenHeight ?? existing.screenHeight,
        language: input.language ?? existing.language,
        timezone: input.timezone ?? existing.timezone,
        country: geo.country ?? existing.country,
        region: geo.region ?? existing.region,
        city: geo.city ?? existing.city,
        latitude: geo.latitude ?? existing.latitude,
        longitude: geo.longitude ?? existing.longitude,
        utmSource: input.utmSource ?? existing.utmSource,
        utmMedium: input.utmMedium ?? existing.utmMedium,
        utmCampaign: input.utmCampaign ?? existing.utmCampaign,
        utmTerm: input.utmTerm ?? existing.utmTerm,
        utmContent: input.utmContent ?? existing.utmContent,
      });
      return mapVisitorToDto(updated);
    }

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
      utmTerm: input.utmTerm ?? null,
      utmContent: input.utmContent ?? null,
      intentScore: 10,
      intentCategory: 'casual',
    });

    // Trigger Visit Notification (Asynchronous, Rate-limited)
    setImmediate(async () => {
      try {
        const visitEnabledSetting = await siteSettingRepository.findByKey(
          SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_VISIT_ENABLED,
        );
        if (visitEnabledSetting?.value !== 'true') return;

        if (parsedUa.deviceType === 'bot' || parsedUa.browser?.toLowerCase().includes('bot')) {
          return;
        }

        const cooldownMinutesSetting = await siteSettingRepository.findByKey(
          SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_VISIT_COOLDOWN_MINUTES,
        );
        const cooldownMs = (parseInt(cooldownMinutesSetting?.value || '60', 10) || 60) * 60 * 1000;
        const now = Date.now();
        const lastSent = visitNotificationCooldown.get(context.ip) || 0;

        if (now - lastSent < cooldownMs) return;

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

  async recordView(
    input: RecordViewInput,
    context?: { ip: string; userAgent: string | undefined; headers?: Record<string, string | string[] | undefined> },
  ) {
    let visitor = await visitorRepository.findBySessionId(input.sessionId);

    // Auto-upsert visitor on the fly to permanently prevent race condition drops
    if (!visitor && context) {
      const parsedUa = parseUserAgent(context.userAgent);
      const geo = await geoService.lookup(context.ip, context.headers);
      visitor = await visitorRepository.create({
        sessionId: input.sessionId,
        ipAddress: normalizeIpForDb(context.ip),
        userAgent: context.userAgent ?? null,
        browser: parsedUa.browser,
        browserVersion: parsedUa.browserVersion,
        os: parsedUa.os,
        osVersion: parsedUa.osVersion,
        deviceType: parsedUa.deviceType,
        screenWidth: null,
        screenHeight: null,
        language: null,
        timezone: null,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        referrer: input.referrer ?? null,
        referrerSource: parseReferrerSource(input.referrer ?? undefined),
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        intentScore: 10,
        intentCategory: 'casual',
      });
    }

    if (!visitor) {
      // Fallback: create minimal visitor record
      visitor = await visitorRepository.create({
        sessionId: input.sessionId,
        ipAddress: '127.0.0.1',
        userAgent: null,
        browser: null,
        browserVersion: null,
        os: null,
        osVersion: null,
        deviceType: 'desktop',
        screenWidth: null,
        screenHeight: null,
        language: null,
        timezone: null,
        country: null,
        region: null,
        city: null,
        latitude: null,
        longitude: null,
        referrer: input.referrer ?? null,
        referrerSource: parseReferrerSource(input.referrer ?? undefined),
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        intentScore: 10,
        intentCategory: 'casual',
      });
    }

    const pageView = await visitorRepository.createPageView({
      visitorId: visitor.id,
      path: input.path,
      title: input.title ?? null,
      referrer: input.referrer ?? null,
      durationSeconds: input.durationSeconds ?? null,
      scrollDepth: input.scrollDepth ?? null,
      loadTimeMs: input.loadTimeMs ?? null,
    });

    // Re-evaluate visitor intent score in background
    setImmediate(() => {
      if (visitor) {
        trackerService.evaluateIntent(visitor.id).catch(() => {});
      }
    });

    return mapPageViewToDto(pageView);
  },

  async recordBeacon(input: RecordBeaconInput) {
    const visitor = await visitorRepository.findBySessionId(input.sessionId);
    if (!visitor) return { success: false };

    // Update latest page view matching path
    const latestPageView = await visitorRepository.findLatestPageView(visitor.id, input.path);
    if (latestPageView) {
      await visitorRepository.updatePageViewDuration(
        latestPageView.id,
        input.durationSeconds ?? 0,
        input.scrollDepth,
        input.loadTimeMs,
      );
    }

    // Refresh visitor lastVisitedAt
    await visitorRepository.updateLastVisit(visitor.id);

    // Re-evaluate visitor intent score
    setImmediate(() => {
      trackerService.evaluateIntent(visitor.id).catch(() => {});
    });

    return { success: true };
  },

  async recordClick(input: RecordClickInput) {
    let visitorId: string | null = null;
    let visitor = null;

    if (input.sessionId) {
      visitor = await visitorRepository.findBySessionId(input.sessionId);
      visitorId = visitor?.id ?? null;
    }

    // Normalize targetType safely
    const validTargetTypes = Object.values(ClickTargetType);
    const safeTargetType: ClickTargetType = validTargetTypes.includes(input.targetType as ClickTargetType)
      ? (input.targetType as ClickTargetType)
      : ClickTargetType.External;

    const linkClick = await visitorRepository.createLinkClick({
      visitorId,
      targetType: safeTargetType,
      targetUrl: input.targetUrl,
      sourcePath: input.sourcePath ?? null,
      label: input.label ?? null,
    });

    // Trigger Resume Download Recruiter Alert
    if (safeTargetType === ClickTargetType.ResumeDownload) {
      setImmediate(async () => {
        try {
          const setting = await siteSettingRepository.findByKey(
            SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_RESUME_DOWNLOAD_ENABLED,
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
                resumeTitle: input.label || 'Active Portfolio Resume',
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

    // Re-evaluate intent if visitor exists
    if (visitorId) {
      setImmediate(() => {
        trackerService.evaluateIntent(visitorId).catch(() => {});
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
    const topCountries = calculateBreakdowns(raw.topCountries, 'country', totalVisitors, 'Unknown Country');
    const topReferrers = calculateBreakdowns(raw.topReferrers, 'referrerSource', totalVisitors, 'Direct / None');
    const deviceBreakdown = calculateBreakdowns(raw.deviceBreakdown, 'deviceType', totalVisitors, 'Unknown Device');
    const browserBreakdown = calculateBreakdowns(raw.browserBreakdown, 'browser', totalVisitors, 'Unknown Browser');
    const osBreakdown = calculateBreakdowns(raw.osBreakdown, 'os', totalVisitors, 'Unknown OS');
    const intentBreakdown = calculateBreakdowns(raw.intentBreakdown, 'intentCategory', totalVisitors, 'Casual');

    return {
      totalPageViews: raw.totalPageViews,
      uniqueVisitors: raw.uniqueVisitors,
      totalSessions: raw.totalSessions,
      avgSessionDurationSeconds: raw.avgSessionDurationSeconds,
      bounceRatePercent: raw.bounceRatePercent,
      totalLinkClicks: raw.totalLinkClicks,
      topCountries,
      topReferrers,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      intentBreakdown,
    };
  },

  async getLivePulse(): Promise<AdminLivePulseDto> {
    const windowMinutesStr = await siteSettingRepository.getValue(
      SITE_SETTING_KEYS.ANALYTICS_LIVE_PULSE_WINDOW_MINUTES,
    );
    const windowMinutes = parseInt(windowMinutesStr || '5', 10) || 5;
    const activeVisitors = await visitorRepository.getLiveActiveCount(windowMinutes);

    return {
      activeVisitors,
      windowMinutes,
      timestamp: new Date().toISOString(),
    };
  },

  async getAdminTimeSeries(period: AnalyticsPeriod = '30d'): Promise<AnalyticsTimeSeriesPoint[]> {
    const isHourly = period === '24h';
    let sinceDate = getSinceDate(period);

    if (period === 'all') {
      const earliest = await visitorRepository.getEarliestPageViewDate();
      sinceDate = earliest ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (!sinceDate) {
      sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const pageViews = await visitorRepository.getRecentPageViews(sinceDate);

    const bucketMap = new Map<string, { pageViews: number; uniqueVisitorSet: Set<string> }>();

    if (isHourly) {
      // Generate 24 continuous hourly buckets: 00:00 to 23:00 (or rolling 24 hours)
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourStr = `${String(d.getHours()).padStart(2, '0')}:00`;
        bucketMap.set(hourStr, { pageViews: 0, uniqueVisitorSet: new Set() });
      }

      for (const pv of pageViews) {
        const d = pv.viewedAt;
        const hourStr = `${String(d.getHours()).padStart(2, '0')}:00`;
        const entry = bucketMap.get(hourStr);
        if (entry) {
          entry.pageViews += 1;
          entry.uniqueVisitorSet.add(pv.visitorId);
        }
      }
    } else {
      // Generate continuous daily date range
      const days = Math.ceil((Date.now() - sinceDate.getTime()) / (24 * 60 * 60 * 1000));
      for (let i = 0; i <= days; i++) {
        const d = new Date(sinceDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0] as string;
        bucketMap.set(dateStr, { pageViews: 0, uniqueVisitorSet: new Set() });
      }

      for (const pv of pageViews) {
        const dateStr = pv.viewedAt.toISOString().split('T')[0] as string;
        const entry = bucketMap.get(dateStr);
        if (entry) {
          entry.pageViews += 1;
          entry.uniqueVisitorSet.add(pv.visitorId);
        }
      }
    }

    const points: AnalyticsTimeSeriesPoint[] = [];
    for (const [key, val] of bucketMap.entries()) {
      points.push({
        date: key,
        pageViews: val.pageViews,
        uniqueVisitors: val.uniqueVisitorSet.size,
      });
    }

    return points;
  },

  async getAdminTopPages(period?: AnalyticsPeriod, limit = 15): Promise<AdminTopPageItem[]> {
    const sinceDate = getSinceDate(period);
    return visitorRepository.getTopPages(sinceDate, limit);
  },

  async getAdminVisitorLogs(page = 1, pageSize = 20) {
    const { skip, take } = getPrismaPagination({ page, pageSize });
    const { visitors, total } = await visitorRepository.getVisitorLogs(skip, take);

    const items: AdminVisitorLogItem[] = visitors.map((v) => ({
      id: v.id,
      sessionId: v.sessionId,
      ipAddress: v.ipAddress,
      country: v.country,
      region: v.region,
      city: v.city,
      deviceType: v.deviceType,
      browser: v.browser,
      os: v.os,
      screenWidth: v.screenWidth,
      screenHeight: v.screenHeight,
      language: v.language,
      timezone: v.timezone,
      referrer: v.referrer,
      referrerSource: v.referrerSource,
      utmSource: v.utmSource,
      utmMedium: v.utmMedium,
      utmCampaign: v.utmCampaign,
      utmTerm: v.utmTerm,
      utmContent: v.utmContent,
      intentScore: v.intentScore,
      intentCategory: v.intentCategory,
      firstVisitedAt: v.firstVisitedAt.toISOString(),
      lastVisitedAt: v.lastVisitedAt.toISOString(),
      visitCount: v.visitCount,
      pageViewsCount: v._count?.pageViews ?? v.pageViews.length,
      linkClicksCount: v._count?.linkClicks ?? 0,
      recentPages: v.pageViews.map((pv) => ({
        path: pv.path,
        title: pv.title,
        viewedAt: pv.viewedAt.toISOString(),
        durationSeconds: pv.durationSeconds,
        scrollDepth: pv.scrollDepth,
      })),
    }));

    return {
      data: items,
      pagination: buildPagination(page, pageSize, total),
    };
  },

  async getVisitorJourney(visitorId: string): Promise<AdminVisitorJourneyDto | null> {
    const visitor = await visitorRepository.getVisitorJourney(visitorId);
    if (!visitor) return null;

    const steps: JourneyStep[] = [];
    let totalDwellTimeSeconds = 0;

    for (const pv of visitor.pageViews) {
      steps.push({
        type: 'page_view',
        title: pv.title || pv.path,
        pathOrUrl: pv.path,
        timestamp: pv.viewedAt.toISOString(),
        durationSeconds: pv.durationSeconds,
        scrollDepth: pv.scrollDepth,
      });
      totalDwellTimeSeconds += pv.durationSeconds ?? 0;
    }

    for (const lc of visitor.linkClicks) {
      steps.push({
        type: 'link_click',
        title: lc.label || lc.targetType,
        pathOrUrl: lc.targetUrl,
        timestamp: lc.clickedAt.toISOString(),
        meta: { sourcePath: lc.sourcePath, targetType: lc.targetType },
      });
    }

    for (const cs of visitor.contactSubmissions) {
      steps.push({
        type: 'contact_submission',
        title: `Contact Submission: ${cs.subject || 'Message'}`,
        pathOrUrl: `/admin/contact`,
        timestamp: cs.createdAt.toISOString(),
        meta: { name: cs.name, email: cs.email },
      });
    }

    // Sort all journey steps chronologically
    steps.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
      visitor: mapVisitorToDto(visitor),
      steps,
      totalDwellTimeSeconds,
    };
  },

  async getAdminClickStats(period?: AnalyticsPeriod, limit = 20): Promise<AdminClickItem[]> {
    const sinceDate = getSinceDate(period);
    const grouped = await visitorRepository.getClickStats(sinceDate, limit);

    return grouped.map((item) => ({
      targetType: item.targetType as ClickTargetType,
      targetUrl: item.targetUrl,
      sourcePath: item.sourcePath,
      label: item.label,
      count: item._count.id,
      lastClickedAt: item._max.clickedAt ? item._max.clickedAt.toISOString() : new Date().toISOString(),
    }));
  },

  async getGeoMapDistribution(period?: AnalyticsPeriod): Promise<AdminGeoMapItem[]> {
    const sinceDate = getSinceDate(period);
    return visitorRepository.getGeoMapDistribution(sinceDate);
  },

  /** Export telemetry data in CSV or JSON format */
  async exportTelemetry(type: 'visitors' | 'pages' | 'clicks' | 'all', period: AnalyticsPeriod = '30d', format = 'csv') {
    const sinceDate = getSinceDate(period);

    if (type === 'visitors') {
      const { visitors } = await visitorRepository.getVisitorLogs(0, 5000);
      if (format === 'json') return visitors;

      const headers = [
        'ID',
        'Session ID',
        'IP Address',
        'Country',
        'City',
        'Device',
        'Browser',
        'OS',
        'Intent Category',
        'Intent Score',
        'Referrer Source',
        'UTM Source',
        'UTM Campaign',
        'Visit Count',
        'First Visited At',
        'Last Visited At',
      ];
      const rows = visitors.map((v) => [
        v.id,
        v.sessionId,
        v.ipAddress,
        v.country ?? '',
        v.city ?? '',
        v.deviceType ?? '',
        v.browser ?? '',
        v.os ?? '',
        v.intentCategory ?? 'casual',
        v.intentScore,
        v.referrerSource ?? 'direct',
        v.utmSource ?? '',
        v.utmCampaign ?? '',
        v.visitCount,
        v.firstVisitedAt.toISOString(),
        v.lastVisitedAt.toISOString(),
      ]);

      return [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    }

    if (type === 'pages') {
      const topPages = await visitorRepository.getTopPages(sinceDate, 500);
      if (format === 'json') return topPages;

      const headers = ['Route Path', 'Page Title', 'Total Views', 'Unique Visitors', 'Avg Duration (s)', 'Avg Scroll Depth (%)'];
      const rows = topPages.map((p) => [
        p.path,
        p.title ?? '',
        p.views,
        p.uniqueVisitors,
        p.avgDurationSeconds ?? 0,
        p.avgScrollDepthPercent ?? 0,
      ]);

      return [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    }

    if (type === 'clicks') {
      const clicks = await visitorRepository.getClickStats(sinceDate, 500);
      if (format === 'json') return clicks;

      const headers = ['Target Type', 'Target URL', 'Label', 'Source Path', 'Click Count', 'Last Clicked At'];
      const rows = clicks.map((c) => [
        c.targetType,
        c.targetUrl,
        c.label ?? '',
        c.sourcePath ?? '',
        c._count.id,
        c._max.clickedAt?.toISOString() ?? '',
      ]);

      return [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    }

    // Default overview export
    const overview = await this.getAdminOverview(period);
    return overview;
  },
};

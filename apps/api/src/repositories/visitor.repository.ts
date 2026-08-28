import { prisma } from '@/config/prisma';
import type { Prisma, ClickTargetType as PrismaClickTargetType } from '@prisma/client';
import type { ClickTargetType } from '@portfolio/shared';

export interface CreateVisitorData {
  sessionId: string;
  ipAddress: string;
  userAgent: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  deviceType: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  language: string | null;
  timezone: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
  referrer: string | null;
  referrerSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  intentScore?: number;
  intentCategory?: string | null;
}

export const visitorRepository = {
  async findBySessionId(sessionId: string) {
    return prisma.visitor.findUnique({ where: { sessionId } });
  },

  async findById(id: string) {
    return prisma.visitor.findUnique({ where: { id } });
  },

  async create(data: CreateVisitorData) {
    return prisma.visitor.create({ data });
  },

  async updateVisitor(
    id: string,
    data: Partial<CreateVisitorData> & { lastVisitedAt?: Date; visitCount?: Prisma.IntFieldUpdateOperationsInput },
  ) {
    return prisma.visitor.update({
      where: { id },
      data,
    });
  },

  async updateLastVisit(id: string, dynamicData?: Partial<CreateVisitorData>) {
    return prisma.visitor.update({
      where: { id },
      data: {
        lastVisitedAt: new Date(),
        visitCount: { increment: 1 },
        ...(dynamicData || {}),
      },
    });
  },

  async updateIntent(id: string, intentScore: number, intentCategory: string) {
    return prisma.visitor.update({
      where: { id },
      data: { intentScore, intentCategory },
    });
  },

  async createPageView(data: {
    visitorId: string;
    path: string;
    title: string | null;
    referrer: string | null;
    durationSeconds: number | null;
    scrollDepth?: number | null;
    loadTimeMs?: number | null;
  }) {
    return prisma.pageView.create({ data });
  },

  async findLatestPageView(visitorId: string, path?: string) {
    return prisma.pageView.findFirst({
      where: {
        visitorId,
        ...(path ? { path } : {}),
      },
      orderBy: { viewedAt: 'desc' },
    });
  },

  async updatePageViewDuration(
    pageViewId: string,
    durationSeconds: number,
    scrollDepth?: number | null,
    loadTimeMs?: number | null,
  ) {
    return prisma.pageView.update({
      where: { id: pageViewId },
      data: {
        durationSeconds,
        ...(scrollDepth !== undefined && scrollDepth !== null ? { scrollDepth } : {}),
        ...(loadTimeMs !== undefined && loadTimeMs !== null ? { loadTimeMs } : {}),
      },
    });
  },

  async createLinkClick(data: {
    visitorId: string | null;
    targetType: ClickTargetType;
    targetUrl: string;
    sourcePath: string | null;
    label?: string | null;
  }) {
    return prisma.linkClick.create({
      data: {
        visitorId: data.visitorId,
        targetType: data.targetType as PrismaClickTargetType,
        targetUrl: data.targetUrl,
        sourcePath: data.sourcePath,
        label: data.label ?? null,
      },
    });
  },

  // ──────────────────────────────────────────────
  // Admin Telemetry Queries
  // ──────────────────────────────────────────────

  async getLiveActiveCount(windowMinutes = 5): Promise<number> {
    const threshold = new Date(Date.now() - windowMinutes * 60 * 1000);
    return prisma.visitor.count({
      where: { lastVisitedAt: { gte: threshold } },
    });
  },

  async getOverviewStats(sinceDate?: Date) {
    const pageViewWhere = sinceDate ? { viewedAt: { gte: sinceDate } } : undefined;
    const visitorWhere = sinceDate ? { lastVisitedAt: { gte: sinceDate } } : undefined;
    const clickWhere = sinceDate ? { clickedAt: { gte: sinceDate } } : undefined;

    const [
      totalPageViews,
      uniqueVisitors,
      sessionAggregate,
      durationAggregate,
      totalLinkClicks,
      topCountries,
      topReferrers,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      intentBreakdown,
    ] = await Promise.all([
      prisma.pageView.count({ where: pageViewWhere }),
      prisma.visitor.count({ where: visitorWhere }),
      prisma.visitor.aggregate({
        _sum: { visitCount: true },
        where: visitorWhere,
      }),
      prisma.pageView.aggregate({
        _avg: { durationSeconds: true },
        where: pageViewWhere,
      }),
      prisma.linkClick.count({ where: clickWhere }),
      prisma.visitor.groupBy({
        by: ['country'],
        _count: { id: true },
        where: visitorWhere,
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.visitor.groupBy({
        by: ['referrerSource'],
        _count: { id: true },
        where: visitorWhere,
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.visitor.groupBy({
        by: ['deviceType'],
        _count: { id: true },
        where: visitorWhere,
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.visitor.groupBy({
        by: ['browser'],
        _count: { id: true },
        where: visitorWhere,
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.visitor.groupBy({
        by: ['os'],
        _count: { id: true },
        where: visitorWhere,
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.visitor.groupBy({
        by: ['intentCategory'],
        _count: { id: true },
        where: visitorWhere,
        orderBy: { _count: { id: 'desc' } },
      }),
      // Real bounce rate: visitors with exactly 1 total page view in the system
      prisma.visitor.count({
        where: {
          ...(visitorWhere || {}),
          pageViews: {
            none: {}, // 0 page views is a bounce
          },
        },
      }),
    ]);

    // Real bounce calculation based on visitors with <= 1 page view vs total visitors
    const bounceVisitors = await prisma.visitor.findMany({
      where: visitorWhere,
      select: {
        _count: {
          select: { pageViews: true },
        },
      },
    });

    const singlePageSessions = bounceVisitors.filter((v) => v._count.pageViews <= 1).length;
    const bounceRatePercent =
      uniqueVisitors > 0 ? Math.round((singlePageSessions / uniqueVisitors) * 100) : 0;

    return {
      totalPageViews,
      uniqueVisitors,
      totalSessions: sessionAggregate._sum.visitCount ?? uniqueVisitors,
      avgSessionDurationSeconds: Math.round(durationAggregate._avg.durationSeconds ?? 0),
      bounceRatePercent: Math.min(100, Math.max(0, bounceRatePercent)),
      totalLinkClicks,
      topCountries,
      topReferrers,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      intentBreakdown,
    };
  },

  async getRecentPageViews(sinceDate: Date) {
    return prisma.pageView.findMany({
      where: { viewedAt: { gte: sinceDate } },
      select: {
        id: true,
        visitorId: true,
        path: true,
        title: true,
        durationSeconds: true,
        scrollDepth: true,
        viewedAt: true,
      },
      orderBy: { viewedAt: 'asc' },
    });
  },

  async getEarliestPageViewDate(): Promise<Date | null> {
    const first = await prisma.pageView.findFirst({
      orderBy: { viewedAt: 'asc' },
      select: { viewedAt: true },
    });
    return first?.viewedAt ?? null;
  },

  async getRecentVisitors(sinceDate: Date) {
    return prisma.visitor.findMany({
      where: { lastVisitedAt: { gte: sinceDate } },
      select: {
        id: true,
        firstVisitedAt: true,
        lastVisitedAt: true,
      },
      orderBy: { firstVisitedAt: 'asc' },
    });
  },

  async getTopPages(sinceDate?: Date, limit = 15) {
    const pageViewWhere = sinceDate ? { viewedAt: { gte: sinceDate } } : undefined;

    // 1. Group by path to compute total views, average duration, and average scroll depth
    const grouped = await prisma.pageView.groupBy({
      by: ['path'],
      _count: { id: true },
      _avg: { durationSeconds: true, scrollDepth: true },
      where: pageViewWhere,
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // 2. Fetch distinct unique visitors and latest title for each top path
    const results = await Promise.all(
      grouped.map(async (item) => {
        const [latestView, uniqueVisitorCount] = await Promise.all([
          prisma.pageView.findFirst({
            where: { path: item.path, ...(pageViewWhere || {}) },
            select: { title: true },
            orderBy: { viewedAt: 'desc' },
          }),
          prisma.pageView
            .groupBy({
              by: ['visitorId'],
              where: { path: item.path, ...(pageViewWhere || {}) },
            })
            .then((r) => r.length),
        ]);

        return {
          path: item.path,
          title: latestView?.title ?? null,
          views: item._count.id,
          uniqueVisitors: uniqueVisitorCount,
          avgDurationSeconds: Math.round(item._avg.durationSeconds ?? 0),
          avgScrollDepthPercent: Math.round(item._avg.scrollDepth ?? 0),
        };
      }),
    );

    return results;
  },

  async getVisitorLogs(skip: number, take: number) {
    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        skip,
        take,
        orderBy: { lastVisitedAt: 'desc' },
        include: {
          pageViews: {
            orderBy: { viewedAt: 'desc' },
            take: 5,
            select: {
              path: true,
              title: true,
              viewedAt: true,
              durationSeconds: true,
              scrollDepth: true,
            },
          },
          _count: {
            select: { pageViews: true, linkClicks: true },
          },
        },
      }),
      prisma.visitor.count(),
    ]);

    return { visitors, total };
  },

  async getVisitorJourney(visitorId: string) {
    const visitor = await prisma.visitor.findUnique({
      where: { id: visitorId },
      include: {
        pageViews: {
          orderBy: { viewedAt: 'asc' },
        },
        linkClicks: {
          orderBy: { clickedAt: 'asc' },
        },
        contactSubmissions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return visitor;
  },

  async getClickStats(sinceDate?: Date, limit = 20) {
    const clickWhere = sinceDate ? { clickedAt: { gte: sinceDate } } : undefined;

    const grouped = await prisma.linkClick.groupBy({
      by: ['targetType', 'targetUrl', 'sourcePath', 'label'],
      _count: { id: true },
      _max: { clickedAt: true },
      where: clickWhere,
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return grouped;
  },

  async getGeoMapDistribution(sinceDate?: Date) {
    const visitorWhere = sinceDate ? { lastVisitedAt: { gte: sinceDate } } : undefined;

    const [grouped, total] = await Promise.all([
      prisma.visitor.groupBy({
        by: ['country'],
        _count: { id: true },
        where: {
          ...visitorWhere,
          country: { not: null },
        },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.visitor.count({
        where: {
          ...visitorWhere,
          country: { not: null },
        },
      }),
    ]);

    const ISO_MAP: Record<string, string> = {
      US: 'United States',
      USA: 'United States',
      IN: 'India',
      IND: 'India',
      GB: 'United Kingdom',
      UK: 'United Kingdom',
      CA: 'Canada',
      CAN: 'Canada',
      DE: 'Germany',
      DEU: 'Germany',
      FR: 'France',
      FRA: 'France',
      AU: 'Australia',
      AUS: 'Australia',
      BR: 'Brazil',
      BRA: 'Brazil',
      JP: 'Japan',
      JPN: 'Japan',
      NL: 'Netherlands',
      NLD: 'Netherlands',
      SG: 'Singapore',
      SGP: 'Singapore',
      SE: 'Sweden',
      SWE: 'Sweden',
      CH: 'Switzerland',
      CHE: 'Switzerland',
      ES: 'Spain',
      ESP: 'Spain',
      IT: 'Italy',
      ITA: 'Italy',
      AE: 'United Arab Emirates',
      ARE: 'United Arab Emirates',
      CN: 'China',
      CHN: 'China',
      RU: 'Russia',
      RUS: 'Russia',
      PL: 'Poland',
      POL: 'Poland',
      IE: 'Ireland',
      IRL: 'Ireland',
      KR: 'South Korea',
      KOR: 'South Korea',
      NZ: 'New Zealand',
      NZL: 'New Zealand',
      ZA: 'South Africa',
      ZAF: 'South Africa',
    };

    return grouped.map((g) => {
      const raw = g.country || 'UNKNOWN';
      const upper = raw.toUpperCase();
      const countryName = ISO_MAP[upper] || raw;
      return {
        countryCode: upper,
        countryName,
        visitorCount: g._count.id,
        percentage: total > 0 ? Math.round((g._count.id / total) * 1000) / 10 : 0,
      };
    });
  },
};

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
}

export const visitorRepository = {
  async findBySessionId(sessionId: string) {
    return prisma.visitor.findUnique({ where: { sessionId } });
  },

  async create(data: CreateVisitorData) {
    return prisma.visitor.create({ data });
  },

  async updateLastVisit(id: string) {
    return prisma.visitor.update({
      where: { id },
      data: {
        lastVisitedAt: new Date(),
        visitCount: { increment: 1 },
      },
    });
  },

  async createPageView(data: {
    visitorId: string;
    path: string;
    title: string | null;
    referrer: string | null;
    durationSeconds: number | null;
  }) {
    return prisma.pageView.create({ data });
  },

  async createLinkClick(data: {
    visitorId: string | null;
    targetType: ClickTargetType;
    targetUrl: string;
    sourcePath: string | null;
  }) {
    return prisma.linkClick.create({
      data: {
        ...data,
        targetType: data.targetType as PrismaClickTargetType,
      },
    });
  },

  // ──────────────────────────────────────────────
  // Admin Telemetry Queries
  // ──────────────────────────────────────────────

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
    ]);

    return {
      totalPageViews,
      uniqueVisitors,
      totalSessions: sessionAggregate._sum.visitCount ?? uniqueVisitors,
      avgSessionDurationSeconds: Math.round(durationAggregate._avg.durationSeconds ?? 0),
      totalLinkClicks,
      topCountries,
      topReferrers,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
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
        viewedAt: true,
      },
      orderBy: { viewedAt: 'asc' },
    });
  },

  async getRecentVisitors(sinceDate: Date) {
    return prisma.visitor.findMany({
      where: { firstVisitedAt: { gte: sinceDate } },
      select: {
        id: true,
        firstVisitedAt: true,
      },
      orderBy: { firstVisitedAt: 'asc' },
    });
  },

  async getTopPages(sinceDate?: Date, limit = 15) {
    const pageViewWhere = sinceDate ? { viewedAt: { gte: sinceDate } } : undefined;

    const grouped = await prisma.pageView.groupBy({
      by: ['path', 'title'],
      _count: { id: true },
      _avg: { durationSeconds: true },
      where: pageViewWhere,
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return grouped;
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
            },
          },
          _count: {
            select: { pageViews: true },
          },
        },
      }),
      prisma.visitor.count(),
    ]);

    return { visitors, total };
  },

  async getClickStats(sinceDate?: Date, limit = 20) {
    const clickWhere = sinceDate ? { clickedAt: { gte: sinceDate } } : undefined;

    const grouped = await prisma.linkClick.groupBy({
      by: ['targetType', 'targetUrl', 'sourcePath'],
      _count: { id: true },
      _max: { clickedAt: true },
      where: clickWhere,
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return grouped;
  },
};

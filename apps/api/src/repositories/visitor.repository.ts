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
};

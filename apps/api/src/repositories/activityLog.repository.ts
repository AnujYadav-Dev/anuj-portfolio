import { prisma } from '@/config/prisma';
import { Prisma } from '@prisma/client';

export interface CreateActivityLogParams {
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
  authorId?: string;
  ipAddress?: string;
}

export const activityLogRepository = {
  async create(params: CreateActivityLogParams) {
    try {
      return await prisma.activityLog.create({
        data: {
          action: params.action,
          entityType: params.entityType ?? null,
          entityId: params.entityId ?? null,
          details: params.details ?? Prisma.JsonNull,
          authorId: params.authorId ?? null,
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch {
      // Activity logging should never fail the main request
      return null;
    }
  },

  async findRecent(limit = 50) {
    return prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            email: true,
          },
        },
      },
    });
  },
};

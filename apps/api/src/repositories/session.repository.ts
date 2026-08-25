import { prisma } from '@/config/prisma';

export interface CreateSessionData {
  authorId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
}

export const sessionRepository = {
  async create(data: CreateSessionData) {
    return prisma.session.create({ data });
  },

  async findByRefreshTokenHash(refreshTokenHash: string) {
    return prisma.session.findFirst({
      where: { refreshTokenHash },
      include: {
        author: { include: { avatar: { select: { url: true } } } },
      },
    });
  },

  async updateRefreshTokenHash(id: string, refreshTokenHash: string, expiresAt: Date) {
    return prisma.session.update({
      where: { id },
      data: { refreshTokenHash, expiresAt },
    });
  },

  async deleteByRefreshTokenHash(refreshTokenHash: string) {
    return prisma.session.deleteMany({ where: { refreshTokenHash } });
  },
};

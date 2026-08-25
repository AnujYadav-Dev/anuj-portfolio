import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

const resumeInclude = {
  file: { select: { url: true } },
};

export const resumeRepository = {
  async findActive() {
    return prisma.resume.findFirst({
      where: { isActive: true },
      include: resumeInclude,
    });
  },

  async findAll() {
    return prisma.resume.findMany({
      orderBy: { createdAt: 'desc' },
      include: resumeInclude,
    });
  },

  async findById(id: string) {
    return prisma.resume.findUnique({
      where: { id },
      include: resumeInclude,
    });
  },

  async create(data: Prisma.ResumeUncheckedCreateInput) {
    return prisma.resume.create({
      data,
      include: resumeInclude,
    });
  },

  async setActive(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.resume.updateMany({
        data: { isActive: false },
      });
      return tx.resume.update({
        where: { id },
        data: { isActive: true },
        include: resumeInclude,
      });
    });
  },

  async delete(id: string) {
    return prisma.resume.delete({ where: { id } });
  },
};

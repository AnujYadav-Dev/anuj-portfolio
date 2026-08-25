import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

const certificateInclude = {
  certificateImage: { select: { url: true } },
};

export const certificateRepository = {
  async findAll(onlyEnabled = true) {
    return prisma.certificate.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { issueDate: 'desc' }],
      include: certificateInclude,
    });
  },

  async findById(id: string) {
    return prisma.certificate.findUnique({
      where: { id },
      include: certificateInclude,
    });
  },

  async create(data: Prisma.CertificateUncheckedCreateInput) {
    return prisma.certificate.create({
      data,
      include: certificateInclude,
    });
  },

  async update(id: string, data: Prisma.CertificateUncheckedUpdateInput) {
    return prisma.certificate.update({
      where: { id },
      data,
      include: certificateInclude,
    });
  },

  async delete(id: string) {
    return prisma.certificate.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.certificate.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};

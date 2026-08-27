import { prisma } from '@/config/prisma';

export const emailTemplateRepository = {
  async findAll(purpose?: string) {
    return prisma.emailTemplate.findMany({
      where: purpose ? { purpose } : undefined,
      orderBy: [{ purpose: 'asc' }, { isActive: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async findById(id: string) {
    return prisma.emailTemplate.findUnique({ where: { id } });
  },

  async findActiveByPurpose(purpose: string) {
    return prisma.emailTemplate.findFirst({
      where: {
        purpose,
        isActive: true,
        isEnabled: true,
      },
    });
  },

  async findByPurpose(purpose: string) {
    return prisma.emailTemplate.findMany({
      where: { purpose },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async create(data: {
    purpose: string;
    name: string;
    description?: string | null;
    subject: string;
    bodyHtml: string;
    bodyText?: string | null;
    variables?: string[];
    isActive?: boolean;
    isEnabled?: boolean;
  }) {
    return prisma.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.emailTemplate.updateMany({
          where: { purpose: data.purpose },
          data: { isActive: false },
        });
      }

      return tx.emailTemplate.create({
        data: {
          purpose: data.purpose,
          name: data.name,
          description: data.description ?? null,
          subject: data.subject,
          bodyHtml: data.bodyHtml,
          bodyText: data.bodyText ?? null,
          variables: data.variables ?? [],
          isActive: data.isActive ?? false,
          isEnabled: data.isEnabled ?? true,
        },
      });
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      subject?: string;
      bodyHtml?: string;
      bodyText?: string | null;
      variables?: string[];
      isEnabled?: boolean;
    },
  ) {
    return prisma.emailTemplate.update({
      where: { id },
      data,
    });
  },

  async setActive(id: string, purpose: string) {
    return prisma.$transaction(async (tx) => {
      await tx.emailTemplate.updateMany({
        where: { purpose },
        data: { isActive: false },
      });

      return tx.emailTemplate.update({
        where: { id },
        data: { isActive: true, isEnabled: true },
      });
    });
  },

  async countByPurpose(purpose: string) {
    return prisma.emailTemplate.count({ where: { purpose } });
  },

  async delete(id: string) {
    return prisma.emailTemplate.delete({
      where: { id },
    });
  },
};

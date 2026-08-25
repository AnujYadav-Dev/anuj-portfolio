import { prisma } from '@/config/prisma';

export const emailTemplateRepository = {
  async findAll() {
    return prisma.emailTemplate.findMany({
      orderBy: { templateKey: 'asc' },
    });
  },

  async findByKey(templateKey: string) {
    return prisma.emailTemplate.findUnique({ where: { templateKey } });
  },

  async update(templateKey: string, data: {
    subject?: string;
    bodyHtml?: string;
    bodyText?: string | null;
  }) {
    return prisma.emailTemplate.update({
      where: { templateKey },
      data,
    });
  },
};

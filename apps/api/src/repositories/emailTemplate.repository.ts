import { prisma } from '@/config/prisma';

export const emailTemplateRepository = {
  async findByKey(templateKey: string) {
    return prisma.emailTemplate.findUnique({ where: { templateKey } });
  },
};

import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

export const newsletterRepository = {
  async findMany(
    where?: Prisma.NewsletterSubscriberWhereInput,
    skip?: number,
    take?: number,
    orderBy: Prisma.NewsletterSubscriberOrderByWithRelationInput = { createdAt: 'desc' },
  ) {
    return prisma.newsletterSubscriber.findMany({
      where,
      skip,
      take,
      orderBy,
    });
  },

  async count(where?: Prisma.NewsletterSubscriberWhereInput) {
    return prisma.newsletterSubscriber.count({ where });
  },

  async findByEmail(email: string) {
    return prisma.newsletterSubscriber.findUnique({ where: { email } });
  },

  async findByToken(confirmationToken: string) {
    return prisma.newsletterSubscriber.findFirst({ where: { confirmationToken } });
  },

  async findById(id: string) {
    return prisma.newsletterSubscriber.findUnique({ where: { id } });
  },

  async create(email: string, name?: string | null, confirmationToken?: string | null) {
    return prisma.newsletterSubscriber.create({
      data: {
        email,
        name: name ?? null,
        confirmationToken: confirmationToken ?? null,
        isConfirmed: !confirmationToken, // auto-confirm if no token generated
      },
    });
  },

  async confirm(token: string) {
    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: { confirmationToken: token },
    });
    if (!subscriber) return null;

    return prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        isConfirmed: true,
        confirmationToken: null,
      },
    });
  },

  async unsubscribe(tokenOrEmail: string) {
    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: {
        OR: [{ confirmationToken: tokenOrEmail }, { email: tokenOrEmail }],
      },
    });
    if (!subscriber) return null;

    return prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        unsubscribedAt: new Date(),
      },
    });
  },

  async delete(id: string) {
    return prisma.newsletterSubscriber.delete({ where: { id } });
  },
};

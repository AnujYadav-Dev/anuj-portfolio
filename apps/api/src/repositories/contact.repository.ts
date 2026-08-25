import { prisma } from '@/config/prisma';
import type { ContactStatus, Prisma } from '@prisma/client';

export interface CreateContactSubmissionData {
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactStatus;
  ipAddress: string | null;
  userAgent: string | null;
  visitorId: string | null;
}

export const contactRepository = {
  async create(data: CreateContactSubmissionData) {
    return prisma.contactSubmission.create({ data });
  },

  async findMany(where?: Prisma.ContactSubmissionWhereInput, skip?: number, take?: number) {
    return prisma.contactSubmission.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        visitor: {
          select: {
            id: true,
            sessionId: true,
            country: true,
            city: true,
            deviceType: true,
            browser: true,
          },
        },
      },
    });
  },

  async count(where?: Prisma.ContactSubmissionWhereInput) {
    return prisma.contactSubmission.count({ where });
  },

  async findById(id: string) {
    return prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        visitor: true,
      },
    });
  },

  async updateStatus(
    id: string,
    status: ContactStatus,
    readAt?: Date | null,
    repliedAt?: Date | null,
  ) {
    return prisma.contactSubmission.update({
      where: { id },
      data: {
        status,
        ...(readAt !== undefined ? { readAt } : {}),
        ...(repliedAt !== undefined ? { repliedAt } : {}),
      },
    });
  },

  async delete(id: string) {
    return prisma.contactSubmission.delete({ where: { id } });
  },
};

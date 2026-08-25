import { prisma } from '@/config/prisma';
import type { ContactStatus } from '@prisma/client';

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
};

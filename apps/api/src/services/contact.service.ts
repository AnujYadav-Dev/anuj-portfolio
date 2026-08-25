import type {
  ContactSubmissionDto,
  CreateContactInput,
  PaginatedResponse,
  PaginationQuery,
} from '@portfolio/shared';
import { EMAIL_TEMPLATE_KEYS } from '@portfolio/shared';
import { ContactStatus, type Prisma } from '@prisma/client';
import { contactRepository } from '@/repositories/contact.repository';
import { visitorRepository } from '@/repositories/visitor.repository';
import { authorRepository } from '@/repositories/author.repository';
import { emailService } from '@/services/email.service';
import { mapContactSubmissionToDto } from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { NotFoundError } from '@/utils/errors';
import { logger } from '@/config/logger';

export const contactService = {
  async submit(
    input: CreateContactInput,
    context: { ip: string | null; userAgent: string | null },
  ): Promise<ContactSubmissionDto> {
    let visitorId: string | null = null;

    if (input.sessionId) {
      const visitor = await visitorRepository.findBySessionId(input.sessionId);
      visitorId = visitor?.id ?? null;
    }

    const submission = await contactRepository.create({
      name: input.name,
      email: input.email,
      subject: input.subject ?? null,
      message: input.message,
      status: ContactStatus.unread,
      ipAddress: context.ip,
      userAgent: context.userAgent,
      visitorId,
    });

    const templateVariables = {
      name: input.name,
      email: input.email,
      subject: input.subject ?? 'No subject',
      message: input.message,
      ipAddress: context.ip ?? 'unknown',
    };

    try {
      await emailService.sendTemplatedEmail({
        templateKey: EMAIL_TEMPLATE_KEYS.CONTACT_AUTO_REPLY,
        to: input.email,
        variables: templateVariables,
      });
    } catch (error) {
      logger.error(
        { err: error, submissionId: submission.id },
        'Failed to send contact auto-reply',
      );
    }

    try {
      const adminEmails = await authorRepository.findAdminEmails();
      for (const adminEmail of adminEmails) {
        await emailService.sendTemplatedEmail({
          templateKey: EMAIL_TEMPLATE_KEYS.CONTACT_ADMIN_NOTIFICATION,
          to: adminEmail,
          variables: templateVariables,
        });
      }
    } catch (error) {
      logger.error(
        { err: error, submissionId: submission.id },
        'Failed to send contact admin notification',
      );
    }

    return mapContactSubmissionToDto(submission);
  },

  async listSubmissions(
    query: PaginationQuery & { status?: ContactStatus },
  ): Promise<PaginatedResponse<ContactSubmissionDto>> {
    const where: Prisma.ContactSubmissionWhereInput = {};
    if (query.status) where.status = query.status;

    const { skip, take } = getPrismaPagination(query, 'createdAt');
    const [items, totalItems] = await Promise.all([
      contactRepository.findMany(where, skip, take),
      contactRepository.count(where),
    ]);

    return {
      data: items.map(mapContactSubmissionToDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async getSubmissionById(id: string): Promise<ContactSubmissionDto> {
    const submission = await contactRepository.findById(id);
    if (!submission) {
      throw new NotFoundError(`Contact submission '${id}' not found`);
    }
    return mapContactSubmissionToDto(submission);
  },

  async updateStatus(id: string, status: ContactStatus): Promise<ContactSubmissionDto> {
    await contactService.getSubmissionById(id);
    const readAt = status === ContactStatus.read ? new Date() : undefined;
    const repliedAt = status === ContactStatus.replied ? new Date() : undefined;
    const updated = await contactRepository.updateStatus(id, status, readAt, repliedAt);
    return mapContactSubmissionToDto(updated);
  },

  async deleteSubmission(id: string): Promise<void> {
    await contactService.getSubmissionById(id);
    await contactRepository.delete(id);
  },
};

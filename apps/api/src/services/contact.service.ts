import type { CreateContactInput } from '@portfolio/shared';
import { EMAIL_TEMPLATE_KEYS } from '@portfolio/shared';
import { ContactStatus } from '@prisma/client';
import { contactRepository } from '@/repositories/contact.repository';
import { visitorRepository } from '@/repositories/visitor.repository';
import { authorRepository } from '@/repositories/author.repository';
import { emailService } from '@/services/email.service';
import { mapContactSubmissionToDto } from '@/utils/mappers';
import { logger } from '@/config/logger';

export const contactService = {
  async submit(
    input: CreateContactInput,
    context: { ip: string | null; userAgent: string | null },
  ) {
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
      logger.error({ err: error, submissionId: submission.id }, 'Failed to send contact auto-reply');
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
};

import type {
  CreateEmailTemplateInput,
  EmailTemplateDto,
  UpdateEmailTemplateInput,
} from '@portfolio/shared';
import { emailTemplateRepository } from '@/repositories/emailTemplate.repository';
import { activityLogService } from '@/services/activityLog.service';
import { mapEmailTemplateToDto } from '@/utils/mappers';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { DEFAULT_FALLBACK_TEMPLATES } from '@/services/email.service';

const STANDARD_TEMPLATE_METADATA: Record<
  string,
  { name: string; description: string; variables: string[] }
> = {
  contact_auto_reply: {
    name: 'Contact Form Auto-Reply',
    description: 'Auto-reply sent to visitors when they submit the contact form.',
    variables: ['name', 'email', 'subject', 'message', 'siteUrl'],
  },
  contact_admin_notification: {
    name: 'Contact Admin Notification',
    description: 'Notification sent to admin when a visitor submits the contact form.',
    variables: ['name', 'email', 'subject', 'message', 'ipAddress', 'submittedAt', 'siteUrl'],
  },
  newsletter_confirmation: {
    name: 'Newsletter Confirmation',
    description: 'Double opt-in verification link sent to new newsletter subscribers.',
    variables: ['name', 'email', 'confirmationUrl', 'siteUrl'],
  },
  newsletter_welcome: {
    name: 'Newsletter Welcome Email',
    description: 'Welcome email sent upon successful newsletter subscription confirmation.',
    variables: ['name', 'email', 'unsubscribeUrl', 'siteUrl'],
  },
  newsletter_admin_notification: {
    name: 'Newsletter New Subscriber Notification',
    description: 'Notification sent to admin when a new user subscribes.',
    variables: ['email', 'name', 'isConfirmed', 'subscribedAt', 'siteUrl'],
  },
  newsletter_unsubscribe_admin_notification: {
    name: 'Newsletter Unsubscribed Notification',
    description: 'Notification sent to admin when a subscriber unsubscribes from the newsletter.',
    variables: ['email', 'name', 'unsubscribedAt', 'siteUrl'],
  },
  newsletter_broadcast: {
    name: 'Newsletter Broadcast Template',
    description: 'Standard layout for publishing newsletter updates and articles.',
    variables: ['name', 'email', 'subject', 'previewText', 'contentHtml', 'unsubscribeUrl', 'siteUrl'],
  },
  resume_download_admin: {
    name: 'Resume Download Alert',
    description: 'Notification sent to admin when a visitor downloads the resume PDF.',
    variables: ['resumeTitle', 'ipAddress', 'country', 'city', 'referrerSource', 'downloadedAt', 'siteUrl'],
  },
  content_published_admin: {
    name: 'Content Published Summary',
    description: 'Summary sent to admin when scheduled content goes live.',
    variables: ['itemCount', 'publishedItemsSummary', 'publishedAt', 'siteUrl'],
  },
  guestbook_admin_notification: {
    name: 'Guestbook New Entry Alert',
    description: 'Notification sent to admin when a new guestbook message is submitted.',
    variables: ['authorName', 'authorEmail', 'message', 'submittedAt', 'siteUrl'],
  },
  guestbook_approved: {
    name: 'Guestbook Entry Approved',
    description: 'Notice sent to author when their guestbook entry is approved.',
    variables: ['authorName', 'authorEmail', 'message', 'approvedAt', 'siteUrl'],
  },
  visit_admin_notification: {
    name: 'Visitor Telemetry Alert',
    description: 'Notification sent to admin when a new unique visitor browses the site.',
    variables: ['city', 'country', 'deviceType', 'os', 'browser', 'referrerSource', 'visitedAt', 'siteUrl'],
  },
  admin_login_security: {
    name: 'Security: Admin Login Alert',
    description: 'Security notification sent to admin upon login.',
    variables: ['ipAddress', 'location', 'deviceType', 'browser', 'loginTime', 'siteUrl'],
  },
  security_profile_updated: {
    name: 'Security: Profile Updated',
    description: 'Security notification sent when admin profile or credentials change.',
    variables: ['adminName', 'adminEmail', 'actionType', 'ipAddress', 'updatedAt', 'siteUrl'],
  },
};

export const emailTemplateService = {
  async ensureDefaultTemplates(): Promise<void> {
    for (const [purpose, fallback] of Object.entries(DEFAULT_FALLBACK_TEMPLATES)) {
      const count = await emailTemplateRepository.countByPurpose(purpose);
      if (count === 0) {
        const meta = STANDARD_TEMPLATE_METADATA[purpose];
        await emailTemplateRepository.create({
          purpose,
          name: meta?.name || `${purpose.replace(/_/g, ' ').toUpperCase()}`,
          description: meta?.description || null,
          subject: fallback.subject,
          bodyHtml: fallback.bodyHtml,
          bodyText: fallback.bodyText,
          variables: meta?.variables || [],
          isActive: true,
          isEnabled: true,
        });
      }
    }
  },

  async listAll(purpose?: string): Promise<EmailTemplateDto[]> {
    await this.ensureDefaultTemplates();
    const templates = await emailTemplateRepository.findAll(purpose);
    return templates.map(mapEmailTemplateToDto);
  },

  async getById(id: string): Promise<EmailTemplateDto> {
    const template = await emailTemplateRepository.findById(id);
    if (!template) {
      throw new NotFoundError(`Email template with ID '${id}' not found`);
    }
    return mapEmailTemplateToDto(template);
  },

  async getActiveByPurpose(purpose: string): Promise<EmailTemplateDto | null> {
    const template = await emailTemplateRepository.findActiveByPurpose(purpose);
    return template ? mapEmailTemplateToDto(template) : null;
  },

  async create(input: CreateEmailTemplateInput): Promise<EmailTemplateDto> {
    const existingCount = await emailTemplateRepository.countByPurpose(input.purpose);
    // If this is the first template for this purpose, automatically make it active
    const shouldBeActive = input.isActive !== undefined ? input.isActive : existingCount === 0;

    const created = await emailTemplateRepository.create({
      purpose: input.purpose,
      name: input.name,
      description: input.description,
      subject: input.subject,
      bodyHtml: input.bodyHtml,
      bodyText: input.bodyText,
      variables: input.variables,
      isActive: shouldBeActive,
      isEnabled: input.isEnabled ?? true,
    });

    activityLogService.log({
      action: 'email_template_create',
      entityType: 'email_template',
      entityId: created.id,
      details: { name: created.name, purpose: created.purpose },
    });

    return mapEmailTemplateToDto(created);
  },

  async update(id: string, input: UpdateEmailTemplateInput): Promise<EmailTemplateDto> {
    const existing = await emailTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Email template with ID '${id}' not found`);
    }

    const updated = await emailTemplateRepository.update(id, input);

    activityLogService.log({
      action: 'email_template_update',
      entityType: 'email_template',
      entityId: id,
      details: { name: updated.name, purpose: updated.purpose },
    });

    return mapEmailTemplateToDto(updated);
  },

  async setActive(id: string): Promise<EmailTemplateDto> {
    const existing = await emailTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Email template with ID '${id}' not found`);
    }

    const updated = await emailTemplateRepository.setActive(id, existing.purpose);

    activityLogService.log({
      action: 'email_template_set_active',
      entityType: 'email_template',
      entityId: id,
      details: { name: updated.name, purpose: updated.purpose },
    });

    return mapEmailTemplateToDto(updated);
  },

  async delete(id: string): Promise<void> {
    const existing = await emailTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Email template with ID '${id}' not found`);
    }

    const count = await emailTemplateRepository.countByPurpose(existing.purpose);
    if (count <= 1) {
      throw new ValidationError(
        'Cannot delete the only template for this purpose. Create or activate another template first.',
      );
    }

    if (existing.isActive) {
      // Find another template of the same purpose to make active
      const others = await emailTemplateRepository.findByPurpose(existing.purpose);
      const fallback = others.find((t) => t.id !== id);
      if (fallback) {
        await emailTemplateRepository.setActive(fallback.id, existing.purpose);
      }
    }

    await emailTemplateRepository.delete(id);

    activityLogService.log({
      action: 'email_template_delete',
      entityType: 'email_template',
      entityId: id,
      details: { name: existing.name, purpose: existing.purpose },
    });
  },
};

import nodemailer from 'nodemailer';
import Mustache from 'mustache';
import { config, isSmtpConfigured } from '@/config/env';
import { logger } from '@/config/logger';
import { EMAIL_RETRY_BASE_DELAY_MS, EMAIL_RETRY_COUNT } from '@/config/constants';
import { emailTemplateRepository } from '@/repositories/emailTemplate.repository';
import { authorRepository } from '@/repositories/author.repository';
import { siteSettingRepository } from '@/repositories/siteSetting.repository';

export interface SendTemplatedEmailInput {
  purpose?: string;
  templateKey?: string; // Legacy alias
  to: string;
  variables: Record<string, string>;
  fallbackSubject?: string;
  fallbackHtml?: string;
  fallbackText?: string;
}

export interface SendBatchEmailRecipient {
  to: string;
  variables?: Record<string, string>;
}

export interface SendBatchEmailInput {
  purpose: string;
  recipients: SendBatchEmailRecipient[];
  commonVariables?: Record<string, string>;
}

export interface SendTestEmailInput {
  to: string;
  purpose?: string;
  templateId?: string | null;
  variables?: Record<string, string>;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth:
        config.SMTP_USER && config.SMTP_PASS
          ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
          : undefined,
    });
  }

  return transporter;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_FALLBACK_TEMPLATES: Record<
  string,
  { subject: string; bodyHtml: string; bodyText: string }
> = {
  contact_auto_reply: {
    subject: 'Thank you for reaching out, {{name}}!',
    bodyHtml:
      '<p>Hi <strong>{{name}}</strong>,</p><p>Thank you for reaching out. I have received your message regarding "{{subject}}" and will get back to you shortly.</p><p>Best regards,<br/>Anuj Yadav</p>',
    bodyText:
      'Hi {{name}},\n\nThank you for reaching out. I have received your message regarding "{{subject}}" and will get back to you shortly.\n\nBest regards,\nAnuj Yadav',
  },
  contact_admin_notification: {
    subject: 'New Contact Inquiry from {{name}}: {{subject}}',
    bodyHtml:
      '<p>You have received a new contact inquiry:</p><p><strong>From:</strong> {{name}} ({{email}})<br/><strong>Subject:</strong> {{subject}}<br/><strong>IP:</strong> {{ipAddress}}</p><p><strong>Message:</strong></p><p>{{message}}</p>',
    bodyText:
      'New contact inquiry:\nFrom: {{name}} ({{email}})\nSubject: {{subject}}\nIP: {{ipAddress}}\nMessage:\n{{message}}',
  },
  newsletter_confirmation: {
    subject: 'Confirm your newsletter subscription',
    bodyHtml:
      '<p>Hi {{name}},</p><p>Please confirm your subscription by clicking <a href="{{confirmationUrl}}">here</a>.</p>',
    bodyText: 'Hi {{name}},\n\nPlease confirm your subscription:\n{{confirmationUrl}}',
  },
  newsletter_welcome: {
    subject: 'Welcome to the Engineering Dispatch!',
    bodyHtml:
      '<p>Hi {{name}},</p><p>Welcome to the newsletter! You will receive periodic engineering updates and case studies.</p>',
    bodyText: 'Hi {{name}},\n\nWelcome to the newsletter!',
  },
  newsletter_admin_notification: {
    subject: 'New Newsletter Subscriber: {{email}}',
    bodyHtml:
      '<p>New subscriber joined your newsletter:</p><p><strong>Email:</strong> {{email}}<br/><strong>Name:</strong> {{name}}</p>',
    bodyText: 'New subscriber:\nEmail: {{email}}\nName: {{name}}',
  },
  newsletter_broadcast: {
    subject: '{{subject}}',
    bodyHtml: '<div>{{{contentHtml}}}</div>',
    bodyText: '{{subject}}\n\n{{contentHtml}}',
  },
  resume_download_admin: {
    subject: 'Resume Downloaded by visitor from {{country}}, {{city}}',
    bodyHtml:
      '<p>A visitor has downloaded your resume:</p><p><strong>Location:</strong> {{city}}, {{country}}<br/><strong>Referrer:</strong> {{referrerSource}}<br/><strong>IP:</strong> {{ipAddress}}</p>',
    bodyText:
      'Resume Downloaded:\nLocation: {{city}}, {{country}}\nReferrer: {{referrerSource}}\nIP: {{ipAddress}}',
  },
  content_published_admin: {
    subject: 'Scheduled Content Published ({{itemCount}} item(s))',
    bodyHtml:
      '<p>The automated scheduler published {{itemCount}} item(s):</p><p>{{publishedItemsSummary}}</p>',
    bodyText: 'Scheduled content published ({{itemCount}} items):\n{{publishedItemsSummary}}',
  },
  guestbook_admin_notification: {
    subject: 'New Guestbook Signature from {{authorName}}',
    bodyHtml:
      '<p>New guestbook entry awaiting moderation from <strong>{{authorName}}</strong> ({{authorEmail}}):</p><p>{{message}}</p>',
    bodyText:
      'New guestbook entry:\nAuthor: {{authorName}} ({{authorEmail}})\nMessage:\n{{message}}',
  },
  guestbook_approved: {
    subject: 'Your guestbook message is now live!',
    bodyHtml:
      '<p>Hi {{authorName}},</p><p>Your guestbook entry has been approved and is now live on the portfolio:</p><p><em>"{{message}}"</em></p>',
    bodyText:
      'Hi {{authorName}},\n\nYour guestbook message is now live:\n"{{message}}"\n\nBest,\nAnuj Yadav',
  },
  visit_admin_notification: {
    subject: 'New Portfolio Visitor from {{country}}, {{city}}',
    bodyHtml:
      '<p>New visitor session:</p><p><strong>Location:</strong> {{city}}, {{country}}<br/><strong>Device:</strong> {{deviceType}} ({{os}}, {{browser}})<br/><strong>Referrer:</strong> {{referrerSource}}</p>',
    bodyText:
      'New visitor session:\nLocation: {{city}}, {{country}}\nDevice: {{deviceType}} ({{os}}, {{browser}})\nReferrer: {{referrerSource}}',
  },
  admin_login_security: {
    subject: 'Security Alert: New Admin Login from {{ipAddress}}',
    bodyHtml:
      '<p>Security Notice: New admin login detected from IP <strong>{{ipAddress}}</strong> ({{location}}) using {{deviceType}} / {{browser}}.</p>',
    bodyText:
      'Security Alert: New admin login from {{ipAddress}} ({{location}}) on {{deviceType}} ({{browser}}).',
  },
  security_profile_updated: {
    subject: 'Security Notice: {{actionType}} on your account',
    bodyHtml:
      '<p>Confirmation: {{actionType}} was performed on your admin account from IP {{ipAddress}} at {{updatedAt}}.</p>',
    bodyText:
      'Security Notice: {{actionType}} on your account from {{ipAddress}} at {{updatedAt}}.',
  },
};

export const emailService = {
  isConfigured(): boolean {
    return isSmtpConfigured();
  },

  async resolveAdminRecipients(): Promise<string[]> {
    try {
      const adminEmails = await authorRepository.findAdminEmails();
      if (adminEmails.length > 0) return adminEmails;
    } catch {
      // Continue to fallback
    }

    try {
      const adminSetting = await siteSettingRepository.findByKey('admin_notification_email');
      if (adminSetting?.value) return [adminSetting.value];

      const authorSetting = await siteSettingRepository.findByKey('author_email');
      if (authorSetting?.value) return [authorSetting.value];
    } catch {
      // Continue to fallback
    }

    if (config.SMTP_FROM) return [config.SMTP_FROM];
    return [];
  },

  async resolveSiteUrl(): Promise<string> {
    try {
      const setting = await siteSettingRepository.findByKey('site_url');
      if (setting?.value && setting.value.trim()) {
        return setting.value.trim().replace(/\/+$/, '');
      }
    } catch {
      // Continue to fallback
    }

    return (config.CORS_ORIGIN || 'http://localhost:3000').replace(/\/+$/, '');
  },

  async sendTemplatedEmail(input: SendTemplatedEmailInput): Promise<void> {
    const purpose = input.purpose || input.templateKey || 'contact_auto_reply';
    const mailer = getTransporter();

    if (!mailer) {
      logger.warn({ purpose, to: input.to }, 'SMTP not configured — skipping email send');
      return;
    }

    let subjectTemplate = input.fallbackSubject;
    let htmlTemplate = input.fallbackHtml;
    let textTemplate = input.fallbackText;

    try {
      const dbTemplate = await emailTemplateRepository.findActiveByPurpose(purpose);
      if (dbTemplate && dbTemplate.isEnabled) {
        subjectTemplate = dbTemplate.subject;
        htmlTemplate = dbTemplate.bodyHtml;
        textTemplate = dbTemplate.bodyText || undefined;
      }
    } catch (err) {
      logger.warn(
        { err, purpose },
        'Failed to fetch active template from database, using fallback',
      );
    }

    // Default fallback if still missing
    if (!subjectTemplate || !htmlTemplate) {
      const fallback = DEFAULT_FALLBACK_TEMPLATES[purpose];
      if (fallback) {
        subjectTemplate = subjectTemplate || fallback.subject;
        htmlTemplate = htmlTemplate || fallback.bodyHtml;
        textTemplate = textTemplate || fallback.bodyText;
      } else {
        subjectTemplate = subjectTemplate || 'Notification from Portfolio';
        htmlTemplate = htmlTemplate || '<p>You have a new notification.</p>';
      }
    }

    const subject = Mustache.render(subjectTemplate, input.variables);
    const html = Mustache.render(htmlTemplate, input.variables);
    const text = textTemplate ? Mustache.render(textTemplate, input.variables) : undefined;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= EMAIL_RETRY_COUNT; attempt++) {
      try {
        await mailer.sendMail({
          from: config.SMTP_FROM,
          to: input.to,
          subject,
          html,
          text,
        });
        logger.info({ purpose, to: input.to }, 'Email sent successfully');
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(
          { err: lastError, attempt, purpose, to: input.to },
          'Email send attempt failed',
        );

        if (attempt < EMAIL_RETRY_COUNT) {
          await sleep(EMAIL_RETRY_BASE_DELAY_MS * attempt);
        }
      }
    }

    logger.error({ err: lastError, purpose, to: input.to }, 'All email send attempts failed');
  },

  async sendBatchEmail(input: SendBatchEmailInput): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of input.recipients) {
      const mergedVariables = {
        ...(input.commonVariables || {}),
        ...(recipient.variables || {}),
      };

      try {
        await this.sendTemplatedEmail({
          purpose: input.purpose,
          to: recipient.to,
          variables: mergedVariables,
        });
        sent++;
      } catch (error) {
        logger.error({ err: error, to: recipient.to }, 'Failed to send batch email recipient');
        failed++;
      }

      // Small pacing delay to avoid SMTP rate limiting on large batches
      await sleep(100);
    }

    return { sent, failed };
  },

  async sendTestEmail(input: SendTestEmailInput): Promise<{ success: boolean; message: string }> {
    const mailer = getTransporter();
    if (!mailer) {
      throw new Error(
        'SMTP is not configured on the server. Please set SMTP_HOST, SMTP_PORT, and SMTP_FROM in environment.',
      );
    }

    let subjectTemplate: string | undefined;
    let htmlTemplate: string | undefined;
    let textTemplate: string | undefined;

    if (input.templateId) {
      const template = await emailTemplateRepository.findById(input.templateId);
      if (template) {
        subjectTemplate = template.subject;
        htmlTemplate = template.bodyHtml;
        textTemplate = template.bodyText || undefined;
      }
    } else if (input.purpose) {
      const template = await emailTemplateRepository.findActiveByPurpose(input.purpose);
      if (template) {
        subjectTemplate = template.subject;
        htmlTemplate = template.bodyHtml;
        textTemplate = template.bodyText || undefined;
      }
    }

    const siteUrl = await this.resolveSiteUrl();

    const testVariables = {
      name: 'Tester',
      email: input.to,
      subject: 'Test Subject Inquiry',
      message: 'This is a sample test message rendered by the portfolio email system.',
      ipAddress: '127.0.0.1',
      submittedAt: new Date().toLocaleString(),
      siteUrl,
      confirmationUrl: `${siteUrl}/newsletter/confirm?token=sample-test-token`,
      unsubscribeUrl: `${siteUrl}/newsletter/unsubscribe?token=sample-test-token`,
      guestbookUrl: `${siteUrl}/guestbook`,
      adminUrl: `${siteUrl}/admin`,
      authorName: 'Guest Tester',
      authorEmail: input.to,
      resumeTitle: 'Software Engineer Resume (v3.2)',
      country: 'United States',
      city: 'San Francisco',
      deviceType: 'Desktop',
      browser: 'Chrome 128',
      os: 'macOS',
      referrerSource: 'GitHub / Direct',
      visitedAt: new Date().toLocaleString(),
      downloadedAt: new Date().toLocaleString(),
      itemCount: '2',
      publishedItemsSummary:
        '• Building Scalable Systems (Blog Post)\n• Dynamic Portfolio Platform (Project)',
      publishedAt: new Date().toLocaleString(),
      adminName: 'Anuj Yadav',
      adminEmail: input.to,
      location: 'San Francisco, US',
      loginTime: new Date().toLocaleString(),
      actionType: 'Password Changed',
      updatedAt: new Date().toLocaleString(),
      contentHtml:
        '<p>This is a broadcast test message from the Anuj Yadav Engineering Dispatch.</p>',
      ...(input.variables || {}),
    };

    const finalSubject = subjectTemplate
      ? Mustache.render(subjectTemplate, testVariables)
      : '[TEST] Portfolio Notification Test';
    const finalHtml = htmlTemplate
      ? Mustache.render(htmlTemplate, testVariables)
      : '<p>This is a test email sent from the portfolio admin dashboard.</p>';
    const finalText = textTemplate
      ? Mustache.render(textTemplate, testVariables)
      : 'This is a test email sent from the portfolio admin dashboard.';

    await mailer.sendMail({
      from: config.SMTP_FROM,
      to: input.to,
      subject: `[TEST] ${finalSubject}`,
      html: finalHtml,
      text: finalText,
    });

    return { success: true, message: `Test email sent successfully to ${input.to}` };
  },
};

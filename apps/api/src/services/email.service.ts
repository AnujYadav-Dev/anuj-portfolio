import nodemailer from 'nodemailer';
import Mustache from 'mustache';
import { config, isSmtpConfigured } from '@/config/env';
import { logger } from '@/config/logger';
import {
  EMAIL_RETRY_BASE_DELAY_MS,
  EMAIL_RETRY_COUNT,
} from '@/config/constants';
import { emailTemplateRepository } from '@/repositories/emailTemplate.repository';
import { AppError } from '@/utils/errors';

export interface SendTemplatedEmailInput {
  templateKey: string;
  to: string;
  variables: Record<string, string>;
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

export const emailService = {
  isConfigured(): boolean {
    return isSmtpConfigured();
  },

  async sendTemplatedEmail(input: SendTemplatedEmailInput): Promise<void> {
    const mailer = getTransporter();

    if (!mailer) {
      logger.warn(
        { templateKey: input.templateKey, to: input.to },
        'SMTP not configured — skipping email send',
      );
      return;
    }

    const template = await emailTemplateRepository.findByKey(input.templateKey);

    if (!template || !template.isEnabled) {
      throw new AppError(
        'NOT_FOUND',
        `Email template '${input.templateKey}' not found or disabled`,
        404,
      );
    }

    const subject = Mustache.render(template.subject, input.variables);
    const html = Mustache.render(template.bodyHtml, input.variables);
    const text = template.bodyText
      ? Mustache.render(template.bodyText, input.variables)
      : undefined;

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
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(
          { err: lastError, attempt, templateKey: input.templateKey },
          'Email send attempt failed',
        );

        if (attempt < EMAIL_RETRY_COUNT) {
          await sleep(EMAIL_RETRY_BASE_DELAY_MS * attempt);
        }
      }
    }

    throw lastError ?? new Error('Email send failed');
  },
};

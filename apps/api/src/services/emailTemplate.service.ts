import type {
  CreateEmailTemplateInput,
  EmailTemplateDto,
  UpdateEmailTemplateInput,
} from '@portfolio/shared';
import { emailTemplateRepository } from '@/repositories/emailTemplate.repository';
import { mapEmailTemplateToDto } from '@/utils/mappers';
import { NotFoundError, ValidationError } from '@/utils/errors';

export const emailTemplateService = {
  async listAll(purpose?: string): Promise<EmailTemplateDto[]> {
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

    return mapEmailTemplateToDto(created);
  },

  async update(id: string, input: UpdateEmailTemplateInput): Promise<EmailTemplateDto> {
    const existing = await emailTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Email template with ID '${id}' not found`);
    }

    const updated = await emailTemplateRepository.update(id, input);
    return mapEmailTemplateToDto(updated);
  },

  async setActive(id: string): Promise<EmailTemplateDto> {
    const existing = await emailTemplateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Email template with ID '${id}' not found`);
    }

    const updated = await emailTemplateRepository.setActive(id, existing.purpose);
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
  },
};

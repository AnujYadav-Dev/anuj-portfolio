import type { UpdateEmailTemplateInput } from '@portfolio/shared';
import { emailTemplateRepository } from '@/repositories/emailTemplate.repository';
import { mapEmailTemplateToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';

export const emailTemplateService = {
  async listAll() {
    const templates = await emailTemplateRepository.findAll();
    return templates.map(mapEmailTemplateToDto);
  },

  async getByKey(key: string) {
    const template = await emailTemplateRepository.findByKey(key);
    if (!template) {
      throw new NotFoundError(`Email template '${key}' not found`);
    }
    return mapEmailTemplateToDto(template);
  },

  async update(key: string, input: UpdateEmailTemplateInput) {
    const existing = await emailTemplateRepository.findByKey(key);
    if (!existing) {
      throw new NotFoundError(`Email template '${key}' not found`);
    }

    const updated = await emailTemplateRepository.update(key, input);
    return mapEmailTemplateToDto(updated);
  },
};

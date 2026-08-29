import { certificateRepository } from '@/repositories/certificate.repository';
import { activityLogService } from '@/services/activityLog.service';
import { mapCertificateToDto } from '@/utils/mappers';
import { NotFoundError } from '@/utils/errors';
import type { CertificateDto, UpsertCertificateInput } from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const certificateService = {
  async listCertificates(onlyEnabled = true): Promise<CertificateDto[]> {
    const records = await certificateRepository.findAll(onlyEnabled);
    return records.map(mapCertificateToDto);
  },

  async getCertificateById(id: string): Promise<CertificateDto> {
    const record = await certificateRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`Certificate '${id}' not found`);
    }
    return mapCertificateToDto(record);
  },

  async createCertificate(input: UpsertCertificateInput): Promise<CertificateDto> {
    const created = await certificateRepository.create({
      name: input.name,
      issuingOrganization: input.issuingOrganization,
      issueDate: new Date(input.issueDate),
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      credentialId: input.credentialId ?? null,
      credentialUrl: input.credentialUrl ?? null,
      certificateImageId: input.certificateImageId ?? null,
      sortOrder: input.sortOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    });

    activityLogService.log({
      action: 'certificate_create',
      entityType: 'certificate',
      entityId: created.id,
      details: { name: created.name, issuingOrganization: created.issuingOrganization },
    });

    return mapCertificateToDto(created);
  },

  async updateCertificate(
    id: string,
    input: Partial<UpsertCertificateInput>,
  ): Promise<CertificateDto> {
    await certificateService.getCertificateById(id);

    const updateData: Prisma.CertificateUncheckedUpdateInput = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.issuingOrganization !== undefined)
      updateData.issuingOrganization = input.issuingOrganization;
    if (input.issueDate !== undefined) updateData.issueDate = new Date(input.issueDate);
    if (input.expiryDate !== undefined)
      updateData.expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;
    if (input.credentialId !== undefined) updateData.credentialId = input.credentialId || null;
    if (input.credentialUrl !== undefined) updateData.credentialUrl = input.credentialUrl || null;
    if (input.certificateImageId !== undefined)
      updateData.certificateImageId = input.certificateImageId || null;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;

    const updated = await certificateRepository.update(id, updateData);

    activityLogService.log({
      action: 'certificate_update',
      entityType: 'certificate',
      entityId: updated.id,
      details: { name: updated.name, issuingOrganization: updated.issuingOrganization },
    });

    return mapCertificateToDto(updated);
  },

  async deleteCertificate(id: string): Promise<void> {
    const existing = await certificateService.getCertificateById(id);
    await certificateRepository.delete(id);

    activityLogService.log({
      action: 'certificate_delete',
      entityType: 'certificate',
      entityId: id,
      details: { name: existing.name, issuingOrganization: existing.issuingOrganization },
    });
  },

  async reorderCertificates(items: { id: string; sortOrder: number }[]): Promise<void> {
    await certificateRepository.reorder(items);
  },
};

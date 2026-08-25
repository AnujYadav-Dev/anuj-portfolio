// Profile entity Zod validation schemas — about sections, skills,
// experience, education, certificates, achievements, timeline,
// resumes, social links.

import { z } from 'zod';
import { slugSchema, seoFieldsSchema } from './common';
import { TimelineEventType } from '../types/enums';

/** Create/update about section. */
export const upsertAboutSectionSchema = z
  .object({
    title: z.string().min(1).max(200),
    slug: slugSchema.pipe(z.string().max(200)),
    content: z.string().optional(),
    icon: z.string().max(50).optional(),
    sortOrder: z.number().int().default(0),
    isEnabled: z.boolean().default(true),
  })
  .merge(seoFieldsSchema);

export type UpsertAboutSectionInput = z.infer<typeof upsertAboutSectionSchema>;

/** Create/update skill category. */
export const upsertSkillCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: slugSchema.pipe(z.string().max(100)),
  description: z.string().optional(),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertSkillCategoryInput = z.infer<typeof upsertSkillCategorySchema>;

/** Create/update skill. */
export const upsertSkillSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: slugSchema.pipe(z.string().max(100)),
  icon: z.string().max(50).optional(),
  proficiency: z.number().int().min(0).max(100).optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertSkillInput = z.infer<typeof upsertSkillSchema>;

/** Create/update experience. */
export const upsertExperienceSchema = z.object({
  companyName: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  companyUrl: z.string().url().optional().or(z.literal('')),
  companyLogoId: z.string().uuid().optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertExperienceInput = z.infer<typeof upsertExperienceSchema>;

/** Create/update education. */
export const upsertEducationSchema = z.object({
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(200),
  fieldOfStudy: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  isCurrent: z.boolean().default(false),
  grade: z.string().max(50).optional(),
  description: z.string().optional(),
  activities: z.string().optional(),
  institutionLogoId: z.string().uuid().optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertEducationInput = z.infer<typeof upsertEducationSchema>;

/** Create/update certificate. */
export const upsertCertificateSchema = z.object({
  name: z.string().min(1).max(200),
  issuingOrganization: z.string().min(1).max(200),
  issueDate: z.string().date(),
  expiryDate: z.string().date().optional(),
  credentialId: z.string().max(200).optional(),
  credentialUrl: z.string().url().optional().or(z.literal('')),
  certificateImageId: z.string().uuid().optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertCertificateInput = z.infer<typeof upsertCertificateSchema>;

/** Create/update achievement. */
export const upsertAchievementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().date().optional(),
  issuer: z.string().max(200).optional(),
  url: z.string().url().optional().or(z.literal('')),
  imageId: z.string().uuid().optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertAchievementInput = z.infer<typeof upsertAchievementSchema>;

/** Create/update timeline event. */
export const upsertTimelineEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  eventType: z.nativeEnum(TimelineEventType),
  date: z.string().date(),
  endDate: z.string().date().optional(),
  icon: z.string().max(50).optional(),
  url: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertTimelineEventInput = z.infer<typeof upsertTimelineEventSchema>;

/** Create/update social link. */
export const upsertSocialLinkSchema = z.object({
  platform: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  url: z.string().url(),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertSocialLinkInput = z.infer<typeof upsertSocialLinkSchema>;

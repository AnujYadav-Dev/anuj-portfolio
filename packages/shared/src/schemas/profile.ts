// Profile entity Zod validation schemas — about sections, skills,
// experience, education, certificates, achievements, timeline,
// resumes, social links.

import { z } from 'zod';
import {
  slugSchema,
  seoFieldsSchema,
  dateStringSchema,
  optionalDateStringSchema,
  optionalUuidSchema,
  optionalUrlSchema,
} from './common';
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
  startDate: dateStringSchema,
  endDate: optionalDateStringSchema,
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  companyUrl: optionalUrlSchema,
  companyLogoId: optionalUuidSchema,
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
  startDate: dateStringSchema,
  endDate: optionalDateStringSchema,
  isCurrent: z.boolean().default(false),
  grade: z.string().max(50).optional(),
  description: z.string().optional(),
  activities: z.string().optional(),
  institutionLogoId: optionalUuidSchema,
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertEducationInput = z.infer<typeof upsertEducationSchema>;

/** Create/update certificate. */
export const upsertCertificateSchema = z.object({
  name: z.string().min(1).max(200),
  issuingOrganization: z.string().min(1).max(200),
  issueDate: dateStringSchema,
  expiryDate: optionalDateStringSchema,
  credentialId: z.string().max(200).optional(),
  credentialUrl: optionalUrlSchema,
  certificateImageId: optionalUuidSchema,
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertCertificateInput = z.infer<typeof upsertCertificateSchema>;

/** Create/update achievement. */
export const upsertAchievementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  date: optionalDateStringSchema,
  issuer: z.string().max(200).optional(),
  url: optionalUrlSchema,
  imageId: optionalUuidSchema,
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
  date: dateStringSchema,
  endDate: optionalDateStringSchema,
  icon: z.string().max(50).optional(),
  url: optionalUrlSchema,
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

/** Create resume schema. */
export const createResumeSchema = z.object({
  title: z.string().min(1).max(200),
  versionLabel: z.string().max(50).optional(),
  fileId: z.string().uuid(),
  isActive: z.boolean().default(false),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

/** Create/update open source contribution schema. */
export const upsertOpensourceSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  url: z.string().url(),
  role: z.string().max(100).optional(),
  stars: z.number().int().min(0).optional(),
  forks: z.number().int().min(0).optional(),
  language: z.string().max(50).optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertOpensourceInput = z.infer<typeof upsertOpensourceSchema>;

/** Create/update gallery item schema. */
export const upsertGalleryItemSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  mediaId: z.string().uuid(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertGalleryItemInput = z.infer<typeof upsertGalleryItemSchema>;

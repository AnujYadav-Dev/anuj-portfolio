// Profile entity DTOs — about sections, skills, experience, education,
// certificates, achievements, timeline, resume, social links.

import type { TimelineEventType } from './enums';

/** About section DTO. */
export interface AboutSectionDto {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  icon: string | null;
  sortOrder: number;
  isEnabled: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
}

/** Skill category with its skills. */
export interface SkillCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isEnabled: boolean;
  skills: SkillDto[];
}

/** Individual skill DTO. */
export interface SkillDto {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  proficiency: number | null;
  sortOrder: number;
  isEnabled: boolean;
  categoryId: string;
}

/** Experience DTO. */
export interface ExperienceDto {
  id: string;
  companyName: string;
  role: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  technologies: string[];
  companyLogoUrl: string | null;
  companyUrl: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

/** Education DTO. */
export interface EducationDto {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  grade: string | null;
  description: string | null;
  activities: string | null;
  institutionLogoUrl: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

/** Certificate DTO. */
export interface CertificateDto {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  certificateImageUrl: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

/** Achievement DTO. */
export interface AchievementDto {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  issuer: string | null;
  url: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isEnabled: boolean;
}

/** Timeline event DTO. */
export interface TimelineEventDto {
  id: string;
  title: string;
  description: string | null;
  eventType: TimelineEventType;
  date: string;
  endDate: string | null;
  icon: string | null;
  url: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

/** Resume DTO. */
export interface ResumeDto {
  id: string;
  title: string;
  versionLabel: string | null;
  isActive: boolean;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

/** Social link DTO. */
export interface SocialLinkDto {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

/** Open source contribution DTO. */
export interface OpensourceContributionDto {
  id: string;
  name: string;
  description: string | null;
  url: string;
  role: string | null;
  stars: number | null;
  forks: number | null;
  language: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isEnabled: boolean;
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  AboutSectionDto,
  AchievementDto,
  CertificateDto,
  EducationDto,
  ExperienceDto,
  GalleryItemDto,
  OpensourceContributionDto,
  ResumeDto,
  SkillCategoryDto,
  SkillDto,
  SocialLinkDto,
  TimelineEventDto,
} from '@portfolio/shared';

export function useAboutSections() {
  return useQuery<{ data: AboutSectionDto[] }>({
    queryKey: ['about-sections'],
    queryFn: () => apiClient.get<{ data: AboutSectionDto[] }>('/about-sections'),
  });
}

export function useSkillCategories() {
  return useQuery<{ data: SkillCategoryDto[] }>({
    queryKey: ['skill-categories'],
    queryFn: () => apiClient.get<{ data: SkillCategoryDto[] }>('/skill-categories'),
  });
}

export function useSkills(categoryId?: string) {
  return useQuery<{ data: SkillDto[] }>({
    queryKey: ['skills', categoryId],
    queryFn: () =>
      apiClient.get<{ data: SkillDto[] }>('/skills', {
        params: categoryId ? { categoryId } : undefined,
      }),
  });
}

export function useExperiences() {
  return useQuery<{ data: ExperienceDto[] }>({
    queryKey: ['experiences'],
    queryFn: () => apiClient.get<{ data: ExperienceDto[] }>('/experiences'),
  });
}

export function useExperience(id?: string) {
  return useQuery<{ data: ExperienceDto }>({
    queryKey: ['experiences', id],
    queryFn: () => apiClient.get<{ data: ExperienceDto }>(`/experiences/${id}`),
    enabled: Boolean(id),
  });
}

export function useEducation() {
  return useQuery<{ data: EducationDto[] }>({
    queryKey: ['education'],
    queryFn: () => apiClient.get<{ data: EducationDto[] }>('/education'),
  });
}

export function useSingleEducation(id?: string) {
  return useQuery<{ data: EducationDto }>({
    queryKey: ['education', id],
    queryFn: () => apiClient.get<{ data: EducationDto }>(`/education/${id}`),
    enabled: Boolean(id),
  });
}

export function useCertificates() {
  return useQuery<{ data: CertificateDto[] }>({
    queryKey: ['certificates'],
    queryFn: () => apiClient.get<{ data: CertificateDto[] }>('/certificates'),
  });
}

export function useAchievements(isFeatured?: boolean) {
  return useQuery<{ data: AchievementDto[] }>({
    queryKey: ['achievements', isFeatured],
    queryFn: () =>
      apiClient.get<{ data: AchievementDto[] }>('/achievements', {
        params: isFeatured !== undefined ? { isFeatured } : undefined,
      }),
  });
}

export function useTimelineEvents(eventType?: string) {
  return useQuery<{ data: TimelineEventDto[] }>({
    queryKey: ['timeline-events', eventType],
    queryFn: () =>
      apiClient.get<{ data: TimelineEventDto[] }>('/timeline-events', {
        params: eventType ? { eventType } : undefined,
      }),
  });
}

export function useActiveResume() {
  return useQuery<{ data: ResumeDto }>({
    queryKey: ['resume-active'],
    queryFn: () => apiClient.get<{ data: ResumeDto }>('/resumes/active'),
  });
}

export function useSocialLinks() {
  return useQuery<{ data: SocialLinkDto[] }>({
    queryKey: ['social-links'],
    queryFn: () => apiClient.get<{ data: SocialLinkDto[] }>('/social-links'),
  });
}

export function useOpenSource(isFeatured?: boolean) {
  return useQuery<{ data: OpensourceContributionDto[] }>({
    queryKey: ['opensource', isFeatured],
    queryFn: () =>
      apiClient.get<{ data: OpensourceContributionDto[] }>('/opensource', {
        params: isFeatured !== undefined ? { isFeatured } : undefined,
      }),
  });
}

export function useGallery(category?: string) {
  return useQuery<{ data: GalleryItemDto[] }>({
    queryKey: ['gallery', category],
    queryFn: () =>
      apiClient.get<{ data: GalleryItemDto[] }>('/gallery', {
        params: category ? { category } : undefined,
      }),
  });
}

import type {
  AboutSection,
  Achievement,
  Author,
  BlogCategory,
  BlogPost,
  Certificate,
  ContactSubmission,
  ContentBlock,
  ContentVersion,
  Education,
  EmailTemplate,
  Experience,
  GalleryItem,
  GuestbookEntry,
  HomepageSection,
  LinkClick,
  Media,
  NavItem,
  NewsletterSubscriber,
  OpensourceContribution,
  Page,
  PageView,
  Project,
  ProjectCategory,
  ProjectImage,
  ResearchPaper,
  Resume,
  SiteSetting,
  Skill,
  SkillCategory,
  SocialLink,
  Tag,
  Testimonial,
  TimelineEvent,
  Visitor,
} from '@prisma/client';
import type {
  AboutSectionDto,
  AchievementDto,
  AuthorDto,
  BlogCategoryDto,
  BlogPostDto,
  BlogPostListItemDto,
  CertificateDto,
  ClickTargetType,
  ContactSubmissionDto,
  ContentBlockDto,
  ContentVersionDto,
  EducationDto,
  EmailTemplateDto,
  ExperienceDto,
  GalleryItemDto,
  GuestbookEntryDto,
  HomepageSectionDto,
  LinkClickDto,
  MediaDto,
  NavItemDto,
  NewsletterSubscriberDto,
  OpensourceContributionDto,
  PageDto,
  PageViewDto,
  ProjectCategoryDto,
  ProjectDto,
  ProjectListItemDto,
  ResearchPaperDto,
  ResearchPaperListItemDto,
  ResumeDto,
  SiteSettingDto,
  SkillCategoryDto,
  SkillDto,
  SocialLinkDto,
  TagDto,
  TestimonialDto,
  TimelineEventDto,
  VisitorDto,
} from '@portfolio/shared';
import {
  BlockType,
  ContactStatus,
  ContentStatus,
  MediaType,
  ModerationStatus,
  NavLocation,
  NavItemType,
  ProjectStatus,
  ProjectType,
  TimelineEventType,
} from '@portfolio/shared';

type AuthorWithAvatar = Author & { avatar?: { url: string } | null };

/** Map Prisma Author to public AuthorDto. */
export function mapAuthorToDto(author: AuthorWithAvatar): AuthorDto {
  return {
    id: author.id,
    username: author.username,
    displayName: author.displayName,
    email: author.email,
    bio: author.bio,
    avatarUrl: author.avatar?.url ?? null,
    isAdmin: author.isAdmin,
    isEnabled: author.isEnabled,
    createdAt: author.createdAt.toISOString(),
    updatedAt: author.updatedAt.toISOString(),
  };
}

/** Map Prisma Media to MediaDto. */
export function mapMediaToDto(media: Media): MediaDto {
  return {
    id: media.id,
    filename: media.filename,
    url: media.url,
    mediaType: media.mediaType as MediaType,
    mimeType: media.mimeType,
    sizeBytes: media.sizeBytes,
    width: media.width,
    height: media.height,
    altText: media.altText,
    caption: media.caption,
    createdAt: media.createdAt.toISOString(),
  };
}

/** Map Prisma Visitor to VisitorDto. */
export function mapVisitorToDto(visitor: Visitor): VisitorDto {
  return {
    id: visitor.id,
    sessionId: visitor.sessionId,
    ipAddress: visitor.ipAddress,
    browser: visitor.browser,
    browserVersion: visitor.browserVersion,
    os: visitor.os,
    osVersion: visitor.osVersion,
    deviceType: visitor.deviceType,
    screenWidth: visitor.screenWidth,
    screenHeight: visitor.screenHeight,
    language: visitor.language,
    timezone: visitor.timezone,
    country: visitor.country,
    region: visitor.region,
    city: visitor.city,
    referrer: visitor.referrer,
    referrerSource: visitor.referrerSource,
    utmSource: visitor.utmSource,
    utmMedium: visitor.utmMedium,
    utmCampaign: visitor.utmCampaign,
    firstVisitedAt: visitor.firstVisitedAt.toISOString(),
    lastVisitedAt: visitor.lastVisitedAt.toISOString(),
    visitCount: visitor.visitCount,
  };
}

/** Map Prisma PageView to PageViewDto. */
export function mapPageViewToDto(pageView: PageView): PageViewDto {
  return {
    id: pageView.id,
    visitorId: pageView.visitorId,
    path: pageView.path,
    title: pageView.title,
    referrer: pageView.referrer,
    durationSeconds: pageView.durationSeconds,
    viewedAt: pageView.viewedAt.toISOString(),
  };
}

/** Map Prisma LinkClick to LinkClickDto. */
export function mapLinkClickToDto(linkClick: LinkClick): LinkClickDto {
  return {
    id: linkClick.id,
    visitorId: linkClick.visitorId,
    targetType: linkClick.targetType as ClickTargetType,
    targetUrl: linkClick.targetUrl,
    sourcePath: linkClick.sourcePath,
    clickedAt: linkClick.clickedAt.toISOString(),
  };
}

/** Map Prisma ContactSubmission to ContactSubmissionDto. */
export function mapContactSubmissionToDto(submission: ContactSubmission): ContactSubmissionDto {
  return {
    id: submission.id,
    name: submission.name,
    email: submission.email,
    subject: submission.subject,
    message: submission.message,
    status: submission.status as ContactStatus,
    ipAddress: submission.ipAddress,
    createdAt: submission.createdAt.toISOString(),
    readAt: submission.readAt?.toISOString() ?? null,
    repliedAt: submission.repliedAt?.toISOString() ?? null,
  };
}

type ProjectWithRelations = Project & {
  author: { id: string; username: string; displayName: string; avatar?: { url: string } | null };
  category?: { id: string; name: string; slug: string } | null;
  coverImage?: { url: string } | null;
  ogImage?: { url: string } | null;
  images?: (ProjectImage & { media: Media })[];
  tags?: { tag: { name: string } }[];
};

/** Map Prisma Project to ProjectDto. */
export function mapProjectToDto(project: ProjectWithRelations, tagNames?: string[]): ProjectDto {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    content: project.content,
    technologies: project.technologies,
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    projectType: project.projectType as ProjectType,
    projectStatus: project.projectStatus as ProjectStatus,
    status: project.status as ContentStatus,
    isFeatured: project.isFeatured,
    startDate: project.startDate?.toISOString().split('T')[0] ?? null,
    endDate: project.endDate?.toISOString().split('T')[0] ?? null,
    sortOrder: project.sortOrder,
    coverImageUrl: project.coverImage?.url ?? null,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
    seoKeywords: project.seoKeywords,
    ogImageUrl: project.ogImage?.url ?? null,
    publishedAt: project.publishedAt?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    author: {
      id: project.author.id,
      username: project.author.username,
      displayName: project.author.displayName,
      avatarUrl: project.author.avatar?.url ?? null,
    },
    category: project.category
      ? {
          id: project.category.id,
          name: project.category.name,
          slug: project.category.slug,
        }
      : null,
    tags: tagNames ?? project.tags?.map((t) => t.tag.name) ?? [],
  };
}

/** Map Prisma Project to ProjectListItemDto. */
export function mapProjectToListItemDto(project: ProjectWithRelations): ProjectListItemDto {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    technologies: project.technologies,
    projectType: project.projectType as ProjectType,
    projectStatus: project.projectStatus as ProjectStatus,
    status: project.status as ContentStatus,
    isFeatured: project.isFeatured,
    coverImageUrl: project.coverImage?.url ?? null,
    publishedAt: project.publishedAt?.toISOString() ?? null,
    author: {
      username: project.author.username,
      displayName: project.author.displayName,
      avatarUrl: project.author.avatar?.url ?? null,
    },
    category: project.category
      ? {
          name: project.category.name,
          slug: project.category.slug,
        }
      : null,
  };
}

/** Map Prisma ProjectCategory to ProjectCategoryDto. */
export function mapProjectCategoryToDto(category: ProjectCategory): ProjectCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sortOrder,
    isEnabled: category.isEnabled,
  };
}

type BlogPostWithRelations = BlogPost & {
  author: { id: string; username: string; displayName: string; avatar?: { url: string } | null };
  category?: { id: string; name: string; slug: string } | null;
  coverImage?: { url: string } | null;
  ogImage?: { url: string } | null;
  tags?: { tag: { name: string } }[];
};

/** Map Prisma BlogPost to BlogPostDto. */
export function mapBlogPostToDto(post: BlogPostWithRelations, tagNames?: string[]): BlogPostDto {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    readingTimeMinutes: post.readingTimeMinutes,
    status: post.status as ContentStatus,
    isFeatured: post.isFeatured,
    coverImageUrl: post.coverImage?.url ?? null,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoKeywords: post.seoKeywords,
    ogImageUrl: post.ogImage?.url ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: {
      id: post.author.id,
      username: post.author.username,
      displayName: post.author.displayName,
      avatarUrl: post.author.avatar?.url ?? null,
    },
    category: post.category
      ? {
          id: post.category.id,
          name: post.category.name,
          slug: post.category.slug,
        }
      : null,
    tags: tagNames ?? post.tags?.map((t) => t.tag.name) ?? [],
  };
}

/** Map Prisma BlogPost to BlogPostListItemDto. */
export function mapBlogPostToListItemDto(post: BlogPostWithRelations): BlogPostListItemDto {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    readingTimeMinutes: post.readingTimeMinutes,
    status: post.status as ContentStatus,
    isFeatured: post.isFeatured,
    coverImageUrl: post.coverImage?.url ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    author: {
      username: post.author.username,
      displayName: post.author.displayName,
    },
    category: post.category
      ? {
          name: post.category.name,
          slug: post.category.slug,
        }
      : null,
  };
}

/** Map Prisma BlogCategory to BlogCategoryDto. */
export function mapBlogCategoryToDto(category: BlogCategory): BlogCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sortOrder,
    isEnabled: category.isEnabled,
  };
}

type ResearchWithRelations = ResearchPaper & {
  author: { id: string; username: string; displayName: string; avatar?: { url: string } | null };
  pdf?: { url: string } | null;
  ogImage?: { url: string } | null;
  tags?: { tag: { name: string } }[];
};

/** Map Prisma ResearchPaper to ResearchPaperDto. */
export function mapResearchPaperToDto(
  paper: ResearchWithRelations,
  tagNames?: string[],
): ResearchPaperDto {
  return {
    id: paper.id,
    title: paper.title,
    slug: paper.slug,
    abstract: paper.abstract,
    content: paper.content,
    doi: paper.doi,
    publicationUrl: paper.publicationUrl,
    publicationName: paper.publicationName,
    publicationDate: paper.publicationDate?.toISOString().split('T')[0] ?? null,
    status: paper.status as ContentStatus,
    isFeatured: paper.isFeatured,
    pdfUrl: paper.pdf?.url ?? null,
    seoTitle: paper.seoTitle,
    seoDescription: paper.seoDescription,
    seoKeywords: paper.seoKeywords,
    ogImageUrl: paper.ogImage?.url ?? null,
    publishedAt: paper.publishedAt?.toISOString() ?? null,
    createdAt: paper.createdAt.toISOString(),
    updatedAt: paper.updatedAt.toISOString(),
    author: {
      id: paper.author.id,
      username: paper.author.username,
      displayName: paper.author.displayName,
      avatarUrl: paper.author.avatar?.url ?? null,
    },
    tags: tagNames ?? paper.tags?.map((t) => t.tag.name) ?? [],
  };
}

/** Map Prisma ResearchPaper to ResearchPaperListItemDto. */
export function mapResearchPaperToListItemDto(
  paper: ResearchWithRelations,
): ResearchPaperListItemDto {
  return {
    id: paper.id,
    title: paper.title,
    slug: paper.slug,
    abstract: paper.abstract,
    publicationName: paper.publicationName,
    publicationDate: paper.publicationDate?.toISOString().split('T')[0] ?? null,
    status: paper.status as ContentStatus,
    isFeatured: paper.isFeatured,
    publishedAt: paper.publishedAt?.toISOString() ?? null,
    author: {
      username: paper.author.username,
      displayName: paper.author.displayName,
      avatarUrl: paper.author.avatar?.url ?? null,
    },
  };
}

type PageWithBlocks = Page & {
  ogImage?: { url: string } | null;
  contentBlocks?: (ContentBlock & { media?: { url: string } | null })[];
};

/** Map Prisma Page to PageDto. */
export function mapPageToDto(page: PageWithBlocks): PageDto {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    status: page.status as ContentStatus,
    isNavVisible: page.isNavVisible,
    sortOrder: page.sortOrder,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    seoKeywords: page.seoKeywords,
    ogImageUrl: page.ogImage?.url ?? null,
    publishedAt: page.publishedAt?.toISOString() ?? null,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
    contentBlocks: page.contentBlocks?.map(mapContentBlockToDto) ?? [],
  };
}

type BlockWithMedia = ContentBlock & { media?: { url: string } | null };

/** Map Prisma ContentBlock to ContentBlockDto. */
export function mapContentBlockToDto(block: BlockWithMedia): ContentBlockDto {
  return {
    id: block.id,
    blockType: block.blockType as BlockType,
    title: block.title,
    content: block.content,
    mediaUrl: block.media?.url ?? null,
    config: (block.config as Record<string, unknown>) ?? {},
    sortOrder: block.sortOrder,
    isEnabled: block.isEnabled,
    pageId: block.pageId,
    homepageSectionId: block.homepageSectionId,
  };
}

/** Map Prisma AboutSection to AboutSectionDto. */
export function mapAboutSectionToDto(section: AboutSection): AboutSectionDto {
  return {
    id: section.id,
    title: section.title,
    slug: section.slug,
    content: section.content,
    icon: section.icon,
    sortOrder: section.sortOrder,
    isEnabled: section.isEnabled,
    seoTitle: section.seoTitle,
    seoDescription: section.seoDescription,
  };
}

type SkillCategoryWithSkills = SkillCategory & { skills?: Skill[] };

/** Map Prisma SkillCategory to SkillCategoryDto. */
export function mapSkillCategoryToDto(category: SkillCategoryWithSkills): SkillCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    sortOrder: category.sortOrder,
    isEnabled: category.isEnabled,
    skills: category.skills?.map(mapSkillToDto) ?? [],
  };
}

/** Map Prisma Skill to SkillDto. */
export function mapSkillToDto(skill: Skill): SkillDto {
  return {
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    icon: skill.icon,
    proficiency: skill.proficiency,
    sortOrder: skill.sortOrder,
    isEnabled: skill.isEnabled,
    categoryId: skill.categoryId,
  };
}

type ExperienceWithLogo = Experience & { companyLogo?: { url: string } | null };

/** Map Prisma Experience to ExperienceDto. */
export function mapExperienceToDto(exp: ExperienceWithLogo): ExperienceDto {
  return {
    id: exp.id,
    companyName: exp.companyName,
    role: exp.role,
    location: exp.location,
    startDate: exp.startDate.toISOString().split('T')[0] ?? '',
    endDate: exp.endDate?.toISOString().split('T')[0] ?? null,
    isCurrent: exp.isCurrent,
    description: exp.description,
    technologies: exp.technologies,
    companyLogoUrl: exp.companyLogo?.url ?? null,
    companyUrl: exp.companyUrl,
    sortOrder: exp.sortOrder,
    isEnabled: exp.isEnabled,
  };
}

type EducationWithLogo = Education & { institutionLogo?: { url: string } | null };

/** Map Prisma Education to EducationDto. */
export function mapEducationToDto(edu: EducationWithLogo): EducationDto {
  return {
    id: edu.id,
    institution: edu.institution,
    degree: edu.degree,
    fieldOfStudy: edu.fieldOfStudy,
    location: edu.location,
    startDate: edu.startDate.toISOString().split('T')[0] ?? '',
    endDate: edu.endDate?.toISOString().split('T')[0] ?? null,
    isCurrent: edu.isCurrent,
    grade: edu.grade,
    description: edu.description,
    activities: edu.activities,
    institutionLogoUrl: edu.institutionLogo?.url ?? null,
    sortOrder: edu.sortOrder,
    isEnabled: edu.isEnabled,
  };
}

type CertificateWithImage = Certificate & { certificateImage?: { url: string } | null };

/** Map Prisma Certificate to CertificateDto. */
export function mapCertificateToDto(cert: CertificateWithImage): CertificateDto {
  return {
    id: cert.id,
    name: cert.name,
    issuingOrganization: cert.issuingOrganization,
    issueDate: cert.issueDate.toISOString().split('T')[0] ?? '',
    expiryDate: cert.expiryDate?.toISOString().split('T')[0] ?? null,
    credentialId: cert.credentialId,
    credentialUrl: cert.credentialUrl,
    certificateImageUrl: cert.certificateImage?.url ?? null,
    sortOrder: cert.sortOrder,
    isEnabled: cert.isEnabled,
  };
}

type AchievementWithImage = Achievement & { image?: { url: string } | null };

/** Map Prisma Achievement to AchievementDto. */
export function mapAchievementToDto(ach: AchievementWithImage): AchievementDto {
  return {
    id: ach.id,
    title: ach.title,
    description: ach.description,
    date: ach.date?.toISOString().split('T')[0] ?? null,
    issuer: ach.issuer,
    url: ach.url,
    imageUrl: ach.image?.url ?? null,
    isFeatured: ach.isFeatured,
    sortOrder: ach.sortOrder,
    isEnabled: ach.isEnabled,
  };
}

/** Map Prisma TimelineEvent to TimelineEventDto. */
export function mapTimelineEventToDto(event: TimelineEvent): TimelineEventDto {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    eventType: event.eventType as TimelineEventType,
    date: event.date.toISOString().split('T')[0] ?? '',
    endDate: event.endDate?.toISOString().split('T')[0] ?? null,
    icon: event.icon,
    url: event.url,
    sortOrder: event.sortOrder,
    isEnabled: event.isEnabled,
  };
}

type ResumeWithFile = Resume & { file?: { url: string } | null };

/** Map Prisma Resume to ResumeDto. */
export function mapResumeToDto(resume: ResumeWithFile): ResumeDto {
  return {
    id: resume.id,
    title: resume.title,
    versionLabel: resume.versionLabel,
    isActive: resume.isActive,
    fileUrl: resume.file?.url ?? '',
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  };
}

/** Map Prisma SocialLink to SocialLinkDto. */
export function mapSocialLinkToDto(link: SocialLink): SocialLinkDto {
  return {
    id: link.id,
    platform: link.platform,
    label: link.label,
    url: link.url,
    icon: link.icon,
    sortOrder: link.sortOrder,
    isEnabled: link.isEnabled,
  };
}

/** Map Prisma OpensourceContribution to OpensourceContributionDto. */
export function mapOpensourceToDto(repo: OpensourceContribution): OpensourceContributionDto {
  return {
    id: repo.id,
    name: repo.name,
    description: repo.description,
    url: repo.url,
    role: repo.role,
    stars: repo.stars,
    forks: repo.forks,
    language: repo.language,
    isFeatured: repo.isFeatured,
    sortOrder: repo.sortOrder,
    isEnabled: repo.isEnabled,
  };
}

type GalleryWithMedia = GalleryItem & { media?: { url: string; altText: string | null } | null };

/** Map Prisma GalleryItem to GalleryItemDto. */
export function mapGalleryItemToDto(item: GalleryWithMedia): GalleryItemDto {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    sortOrder: item.sortOrder,
    isEnabled: item.isEnabled,
    mediaUrl: item.media?.url ?? '',
    altText: item.media?.altText ?? null,
    createdAt: item.createdAt.toISOString(),
  };
}

/** Map Prisma HomepageSection to HomepageSectionDto. */
export function mapHomepageSectionToDto(section: HomepageSection): HomepageSectionDto {
  return {
    id: section.id,
    sectionKey: section.sectionKey,
    title: section.title,
    sortOrder: section.sortOrder,
    isEnabled: section.isEnabled,
    config: (section.config as Record<string, unknown>) ?? {},
  };
}

type NavItemWithChildren = NavItem & { children?: NavItemWithChildren[] };

/** Map Prisma NavItem to NavItemDto (recursive). */
export function mapNavItemToDto(nav: NavItemWithChildren): NavItemDto {
  return {
    id: nav.id,
    label: nav.label,
    url: nav.url,
    location: nav.location as NavLocation,
    itemType: (nav.itemType as NavItemType) ?? NavItemType.Link,
    description: nav.description,
    icon: nav.icon,
    badge: nav.badge,
    config: (nav.config as Record<string, unknown>) ?? {},
    isExternal: nav.isExternal,
    sortOrder: nav.sortOrder,
    isEnabled: nav.isEnabled,
    parentId: nav.parentId,
    children: nav.children?.map(mapNavItemToDto) ?? [],
  };
}

/** Map Prisma SiteSetting to SiteSettingDto. */
export function mapSiteSettingToDto(setting: SiteSetting): SiteSettingDto {
  return {
    id: setting.id,
    key: setting.key,
    value: setting.value,
    group: setting.group,
  };
}

/** Map Prisma GuestbookEntry to GuestbookEntryDto. */
export function mapGuestbookEntryToDto(entry: GuestbookEntry): GuestbookEntryDto {
  return {
    id: entry.id,
    authorName: entry.authorName,
    authorEmail: entry.authorEmail,
    message: entry.message,
    moderationStatus: entry.moderationStatus as ModerationStatus,
    createdAt: entry.createdAt.toISOString(),
  };
}

type TestimonialWithAvatar = Testimonial & { authorAvatar?: { url: string } | null };

/** Map Prisma Testimonial to TestimonialDto. */
export function mapTestimonialToDto(test: TestimonialWithAvatar): TestimonialDto {
  return {
    id: test.id,
    authorName: test.authorName,
    authorTitle: test.authorTitle,
    authorCompany: test.authorCompany,
    authorAvatarUrl: test.authorAvatar?.url ?? null,
    content: test.content,
    url: test.url,
    isFeatured: test.isFeatured,
    sortOrder: test.sortOrder,
    isEnabled: test.isEnabled,
  };
}

/** Map Prisma NewsletterSubscriber to NewsletterSubscriberDto. */
export function mapNewsletterSubscriberToDto(sub: NewsletterSubscriber): NewsletterSubscriberDto {
  return {
    id: sub.id,
    email: sub.email,
    name: sub.name,
    isConfirmed: sub.isConfirmed,
    createdAt: sub.createdAt.toISOString(),
  };
}

/** Map Prisma Tag to TagDto. */
export function mapTagToDto(tag: Tag): TagDto {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    createdAt: tag.createdAt.toISOString(),
  };
}

type VersionWithAuthor = ContentVersion & { createdBy?: { displayName: string } | null };

/** Map Prisma ContentVersion to ContentVersionDto. */
export function mapContentVersionToDto(v: VersionWithAuthor): ContentVersionDto {
  return {
    id: v.id,
    entityType: v.entityType as any,
    entityId: v.entityId,
    version: v.version,
    snapshot: (v.snapshot as Record<string, unknown>) ?? {},
    changeSummary: v.changeSummary,
    createdAt: v.createdAt.toISOString(),
    createdByName: v.createdBy?.displayName ?? null,
  };
}

/** Map MIME type string to MediaType enum value. */
export function mimeTypeToMediaType(mimeType: string): MediaType {
  if (mimeType === 'application/pdf') {
    return MediaType.Pdf;
  }
  if (mimeType.startsWith('image/')) {
    return MediaType.Image;
  }
  if (mimeType.startsWith('video/')) {
    return MediaType.Video;
  }
  return MediaType.Other;
}

export function mapEmailTemplateToDto(t: EmailTemplate): EmailTemplateDto {
  return {
    id: t.id,
    purpose: t.purpose,
    templateKey: t.purpose,
    name: t.name,
    description: t.description,
    subject: t.subject,
    bodyHtml: t.bodyHtml,
    bodyText: t.bodyText,
    variables: t.variables,
    isActive: t.isActive,
    isEnabled: t.isEnabled,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export type { EmailTemplate };

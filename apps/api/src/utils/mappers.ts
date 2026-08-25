import type {
  Author,
  ContactSubmission,
  EmailTemplate,
  LinkClick,
  Media,
  PageView,
  Visitor,
} from '@prisma/client';
import type { ClickTargetType } from '@portfolio/shared';
import {
  ContactStatus,
  MediaType,
  type AuthorDto,
  type ContactSubmissionDto,
  type LinkClickDto,
  type MediaDto,
  type PageViewDto,
  type VisitorDto,
} from '@portfolio/shared';

type AuthorWithAvatar = Author & { avatar?: { url: string } | null };

/** Map Prisma Author to public AuthorDto (never exposes passwordHash). */
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
export function mapContactSubmissionToDto(
  submission: ContactSubmission,
): ContactSubmissionDto {
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

export type { EmailTemplate };

// Interaction DTOs — contact, guestbook, testimonials, newsletter.

import type { ContactStatus, ModerationStatus } from './enums';

/** Contact submission DTO. */
export interface ContactSubmissionDto {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactStatus;
  ipAddress: string | null;
  createdAt: string;
  readAt: string | null;
  repliedAt: string | null;
}

/** Create contact submission request. */
export interface CreateContactRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  sessionId?: string;
}

/** Guestbook entry DTO. */
export interface GuestbookEntryDto {
  id: string;
  authorName: string;
  message: string;
  moderationStatus: ModerationStatus;
  createdAt: string;
}

/** Create guestbook entry request. */
export interface CreateGuestbookEntryRequest {
  authorName: string;
  authorEmail?: string;
  message: string;
}

/** Testimonial DTO. */
export interface TestimonialDto {
  id: string;
  authorName: string;
  authorTitle: string | null;
  authorCompany: string | null;
  authorAvatarUrl: string | null;
  content: string;
  url: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isEnabled: boolean;
}

/** Create testimonial request payload. */
export interface CreateTestimonialRequest {
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  content: string;
  authorAvatarId?: string;
  url?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  isEnabled?: boolean;
}

/** Update testimonial request payload. */
export interface UpdateTestimonialRequest extends Partial<CreateTestimonialRequest> {}


/** Newsletter subscribe request. */
export interface NewsletterSubscribeRequest {
  email: string;
  name?: string;
}

/** Newsletter subscriber DTO. */
export interface NewsletterSubscriberDto {
  id: string;
  email: string;
  name: string | null;
  isConfirmed: boolean;
  createdAt: string;
}

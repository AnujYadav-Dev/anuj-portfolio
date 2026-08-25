// Interaction Zod validation schemas — contact, guestbook, newsletter.

import { z } from 'zod';
import { paginationSchema } from './common';
import { ModerationStatus, ContactStatus } from '../types/enums';

/** Create contact submission request. */
export const createContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().max(300).optional(),
  message: z.string().min(1).max(5000),
  sessionId: z.string().min(1).max(255).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

/** List contact submissions query parameters. */
export const listContactSubmissionsQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ContactStatus).optional(),
});

export type ListContactSubmissionsQuery = z.infer<typeof listContactSubmissionsQuerySchema>;

/** Update contact status schema. */
export const updateContactStatusSchema = z.object({
  status: z.nativeEnum(ContactStatus),
});

export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;

/** Create guestbook entry request. */
export const createGuestbookEntrySchema = z.object({
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().optional(),
  message: z.string().min(1).max(1000),
});

export type CreateGuestbookEntryInput = z.infer<typeof createGuestbookEntrySchema>;

/** List guestbook admin query parameters. */
export const listGuestbookAdminQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ModerationStatus).optional(),
  moderationStatus: z.nativeEnum(ModerationStatus).optional(),
});

export type ListGuestbookAdminQuery = z.infer<typeof listGuestbookAdminQuerySchema>;

/** Moderate guestbook entry schema. */
export const moderateGuestbookSchema = z.object({
  status: z.nativeEnum(ModerationStatus),
});

export type ModerateGuestbookInput = z.infer<typeof moderateGuestbookSchema>;

/** Newsletter subscription request. */
export const newsletterSubscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(200).optional(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

/** List newsletter subscribers query parameters. */
export const listNewsletterSubscribersQuerySchema = paginationSchema.extend({
  status: z.enum(['all', 'confirmed', 'pending', 'unsubscribed']).optional(),
  isConfirmed: z.coerce.boolean().optional(),
});

export type ListNewsletterSubscribersQuery = z.infer<typeof listNewsletterSubscribersQuerySchema>;

/** Create/update testimonial schema. */
export const upsertTestimonialSchema = z.object({
  authorName: z.string().min(1).max(200),
  authorTitle: z.string().max(200).optional(),
  authorCompany: z.string().max(200).optional(),
  authorAvatarId: z.string().uuid().optional(),
  content: z.string().min(1),
  url: z.string().url().optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertTestimonialInput = z.infer<typeof upsertTestimonialSchema>;

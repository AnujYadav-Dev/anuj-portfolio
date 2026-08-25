// Interaction Zod validation schemas — contact, guestbook, newsletter.

import { z } from 'zod';

/** Create contact submission request. */
export const createContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().max(300).optional(),
  message: z.string().min(1).max(5000),
  sessionId: z.string().min(1).max(255).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

/** Create guestbook entry request. */
export const createGuestbookEntrySchema = z.object({
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().optional(),
  message: z.string().min(1).max(1000),
});

export type CreateGuestbookEntryInput = z.infer<typeof createGuestbookEntrySchema>;

/** Newsletter subscription request. */
export const newsletterSubscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(200).optional(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

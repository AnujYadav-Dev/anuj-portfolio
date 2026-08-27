// Shared constants
// Error codes, default settings, section keys, and system constants.

/** Standard API error codes. */
export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

/** Default pagination values. */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** Default homepage sections in canonical order. */
export const DEFAULT_HOMEPAGE_SECTIONS = [
  'hero',
  'about',
  'skills',
  'featured_projects',
  'experience',
  'latest_articles',
  'contact',
] as const;

/** Email template purpose keys stored in `email_templates.purpose`. */
export const EMAIL_TEMPLATE_KEYS = {
  CONTACT_AUTO_REPLY: 'contact_auto_reply',
  CONTACT_ADMIN_NOTIFICATION: 'contact_admin_notification',
  NEWSLETTER_CONFIRMATION: 'newsletter_confirmation',
  NEWSLETTER_WELCOME: 'newsletter_welcome',
  NEWSLETTER_ADMIN_NOTIFICATION: 'newsletter_admin_notification',
  NEWSLETTER_BROADCAST: 'newsletter_broadcast',
  RESUME_DOWNLOAD_ADMIN: 'resume_download_admin',
  CONTENT_PUBLISHED_ADMIN: 'content_published_admin',
  GUESTBOOK_ADMIN_NOTIFICATION: 'guestbook_admin_notification',
  GUESTBOOK_APPROVED: 'guestbook_approved',
  VISIT_ADMIN_NOTIFICATION: 'visit_admin_notification',
  ADMIN_LOGIN_SECURITY: 'admin_login_security',
  SECURITY_PROFILE_UPDATED: 'security_profile_updated',
} as const;

/** Reserved site settings keys. */
export const SITE_SETTING_KEYS = {
  SITE_TITLE: 'site_title',
  SITE_DESCRIPTION: 'site_description',
  AVAILABILITY_STATUS: 'availability_status',
  DEFAULT_SEO_TITLE: 'default_seo_title',
  DEFAULT_SEO_DESCRIPTION: 'default_seo_description',
  ANALYTICS_ENABLED: 'analytics_enabled',
  EMAIL_NOTIFICATIONS_VISIT_ENABLED: 'email_notifications_visit_enabled',
  EMAIL_NOTIFICATIONS_VISIT_COOLDOWN_MINUTES: 'email_notifications_visit_cooldown_minutes',
  EMAIL_NOTIFICATIONS_RESUME_DOWNLOAD_ENABLED: 'email_notifications_resume_download_enabled',
  EMAIL_NOTIFICATIONS_CONTACT_ENABLED: 'email_notifications_contact_enabled',
  EMAIL_NOTIFICATIONS_NEWSLETTER_ENABLED: 'email_notifications_newsletter_enabled',
  EMAIL_NOTIFICATIONS_GUESTBOOK_ENABLED: 'email_notifications_guestbook_enabled',
  EMAIL_NOTIFICATIONS_SCHEDULED_PUBLISH_ENABLED: 'email_notifications_scheduled_publish_enabled',
  EMAIL_NOTIFICATIONS_SECURITY_LOGIN_ENABLED: 'email_notifications_security_login_enabled',
  NEWSLETTER_DOUBLE_OPT_IN: 'newsletter_double_opt_in',
  ADMIN_NOTIFICATION_EMAIL: 'admin_notification_email',
} as const;

/** Availability status values. */
export const AVAILABILITY_STATUSES = {
  AVAILABLE: 'available',
  FREELANCE: 'freelance',
  UNAVAILABLE: 'unavailable',
} as const;

/** Content character limits. */
export const CONTENT_LIMITS = {
  MAX_TITLE_LENGTH: 300,
  MAX_SLUG_LENGTH: 300,
  MAX_SEO_TITLE_LENGTH: 200,
  MAX_SEO_DESCRIPTION_LENGTH: 500,
  MAX_SEO_KEYWORDS_LENGTH: 500,
  MAX_NAME_LENGTH: 200,
  MAX_EMAIL_LENGTH: 255,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_GUESTBOOK_MESSAGE_LENGTH: 1000,
} as const;

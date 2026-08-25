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

/** Reserved site settings keys. */
export const SITE_SETTING_KEYS = {
  SITE_TITLE: 'site_title',
  SITE_DESCRIPTION: 'site_description',
  AVAILABILITY_STATUS: 'availability_status',
  DEFAULT_SEO_TITLE: 'default_seo_title',
  DEFAULT_SEO_DESCRIPTION: 'default_seo_description',
  ANALYTICS_ENABLED: 'analytics_enabled',
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

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
  NEWSLETTER_UNSUBSCRIBE_ADMIN_NOTIFICATION: 'newsletter_unsubscribe_admin_notification',
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
  ANALYTICS_INTENT_SCORING_ENABLED: 'analytics_intent_scoring_enabled',
  ANALYTICS_LIVE_PULSE_WINDOW_MINUTES: 'analytics_live_pulse_window_minutes',
  ANALYTICS_IGNORE_ADMIN_TRAFFIC: 'analytics_ignore_admin_traffic',
  ANALYTICS_TRACK_WEB_VITALS: 'analytics_track_web_vitals',
  ANALYTICS_TRACK_SCROLL_DEPTH: 'analytics_track_scroll_depth',
  ANALYTICS_TRACK_CODE_COPIES: 'analytics_track_code_copies',
  ANALYTICS_INTENT_WEIGHTS_JSON: 'analytics_intent_weights_json',
  EMAIL_NOTIFICATIONS_VISIT_ENABLED: 'email_notifications_visit_enabled',
  EMAIL_NOTIFICATIONS_VISIT_COOLDOWN_MINUTES: 'email_notifications_visit_cooldown_minutes',
  EMAIL_NOTIFICATIONS_RESUME_DOWNLOAD_ENABLED: 'email_notifications_resume_download_enabled',
  EMAIL_NOTIFICATIONS_CONTACT_ENABLED: 'email_notifications_contact_enabled',
  EMAIL_NOTIFICATIONS_NEWSLETTER_ENABLED: 'email_notifications_newsletter_enabled',
  EMAIL_NOTIFICATIONS_NEWSLETTER_UNSUBSCRIBE_ENABLED: 'email_notifications_newsletter_unsubscribe_enabled',
  EMAIL_NOTIFICATIONS_GUESTBOOK_ENABLED: 'email_notifications_guestbook_enabled',
  EMAIL_NOTIFICATIONS_SCHEDULED_PUBLISH_ENABLED: 'email_notifications_scheduled_publish_enabled',
  EMAIL_NOTIFICATIONS_SECURITY_LOGIN_ENABLED: 'email_notifications_security_login_enabled',
  EMAIL_NOTIFICATIONS_AUTO_BROADCAST_BLOG: 'email_notifications_auto_broadcast_blog',
  EMAIL_NOTIFICATIONS_AUTO_BROADCAST_PROJECT: 'email_notifications_auto_broadcast_project',
  EMAIL_NOTIFICATIONS_AUTO_BROADCAST_RESEARCH: 'email_notifications_auto_broadcast_research',
  NEWSLETTER_DOUBLE_OPT_IN: 'newsletter_double_opt_in',
  ADMIN_NOTIFICATION_EMAIL: 'admin_notification_email',
} as const;

/** Canonical default system site settings dictionary. */
export const DEFAULT_SYSTEM_SITE_SETTINGS: Array<{
  key: string;
  value: string;
  group: string;
}> = [
  { key: SITE_SETTING_KEYS.SITE_TITLE, value: 'Anuj Yadav | Portfolio', group: 'general' },
  {
    key: SITE_SETTING_KEYS.SITE_DESCRIPTION,
    value: 'Personal portfolio, engineering archive, and technical writings.',
    group: 'general',
  },
  { key: SITE_SETTING_KEYS.AVAILABILITY_STATUS, value: 'available', group: 'general' },
  {
    key: SITE_SETTING_KEYS.DEFAULT_SEO_TITLE,
    value: 'Anuj Yadav - Full-Stack & Systems Engineer',
    group: 'general',
  },
  {
    key: SITE_SETTING_KEYS.DEFAULT_SEO_DESCRIPTION,
    value: 'Portfolio and technical writings of Anuj Yadav.',
    group: 'general',
  },
  { key: SITE_SETTING_KEYS.ANALYTICS_ENABLED, value: 'true', group: 'analytics' },
  {
    key: SITE_SETTING_KEYS.ANALYTICS_INTENT_SCORING_ENABLED,
    value: 'true',
    group: 'analytics',
  },
  {
    key: SITE_SETTING_KEYS.ANALYTICS_LIVE_PULSE_WINDOW_MINUTES,
    value: '5',
    group: 'analytics',
  },
  {
    key: SITE_SETTING_KEYS.ANALYTICS_IGNORE_ADMIN_TRAFFIC,
    value: 'true',
    group: 'analytics',
  },
  {
    key: SITE_SETTING_KEYS.ANALYTICS_TRACK_WEB_VITALS,
    value: 'true',
    group: 'analytics',
  },
  {
    key: SITE_SETTING_KEYS.ANALYTICS_TRACK_SCROLL_DEPTH,
    value: 'true',
    group: 'analytics',
  },
  {
    key: SITE_SETTING_KEYS.ANALYTICS_TRACK_CODE_COPIES,
    value: 'true',
    group: 'analytics',
  },
  {
    key: SITE_SETTING_KEYS.ANALYTICS_INTENT_WEIGHTS_JSON,
    value: '{"resumeDownload":40,"contactSubmission":50,"worksView":15,"experienceView":15,"githubClick":20,"liveDemoClick":20,"blogResearch":20,"multiPage":15}',
    group: 'analytics',
  },
  { key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_VISIT_ENABLED, value: 'false', group: 'notifications' },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_VISIT_COOLDOWN_MINUTES,
    value: '60',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_RESUME_DOWNLOAD_ENABLED,
    value: 'true',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_CONTACT_ENABLED,
    value: 'true',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_NEWSLETTER_ENABLED,
    value: 'true',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_NEWSLETTER_UNSUBSCRIBE_ENABLED,
    value: 'true',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_GUESTBOOK_ENABLED,
    value: 'true',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_SCHEDULED_PUBLISH_ENABLED,
    value: 'true',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_SECURITY_LOGIN_ENABLED,
    value: 'true',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_AUTO_BROADCAST_BLOG,
    value: 'true',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_AUTO_BROADCAST_PROJECT,
    value: 'false',
    group: 'notifications',
  },
  {
    key: SITE_SETTING_KEYS.EMAIL_NOTIFICATIONS_AUTO_BROADCAST_RESEARCH,
    value: 'false',
    group: 'notifications',
  },
  { key: SITE_SETTING_KEYS.NEWSLETTER_DOUBLE_OPT_IN, value: 'true', group: 'newsletter' },
  {
    key: SITE_SETTING_KEYS.ADMIN_NOTIFICATION_EMAIL,
    value: 'anujyadav9449@gmail.com',
    group: 'notifications',
  },
];


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

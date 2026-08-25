// Shared enum definitions — mirrors Prisma/PostgreSQL enums.
// Used by both frontend and backend for type safety.

/** Content lifecycle status. */
export enum ContentStatus {
  Draft = 'draft',
  Published = 'published',
  Scheduled = 'scheduled',
  Archived = 'archived',
  Disabled = 'disabled',
}

/** Media file types. */
export enum MediaType {
  Image = 'image',
  Video = 'video',
  Pdf = 'pdf',
  Document = 'document',
  Other = 'other',
}

/** Project type categories. */
export enum ProjectType {
  Personal = 'personal',
  Freelance = 'freelance',
  Academic = 'academic',
  Professional = 'professional',
  OpenSource = 'open_source',
}

/** Project development status. */
export enum ProjectStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  OnHold = 'on_hold',
  Abandoned = 'abandoned',
}

/** Timeline event types. */
export enum TimelineEventType {
  Education = 'education',
  Job = 'job',
  Project = 'project',
  Achievement = 'achievement',
  Milestone = 'milestone',
}

/** Guestbook entry moderation status. */
export enum ModerationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

/** Contact submission read status. */
export enum ContactStatus {
  Unread = 'unread',
  Read = 'read',
  Replied = 'replied',
  Archived = 'archived',
}

/** Content block type for homepage/page builder. */
export enum BlockType {
  Text = 'text',
  Markdown = 'markdown',
  Image = 'image',
  ProjectList = 'project_list',
  BlogList = 'blog_list',
  Stats = 'stats',
  Cta = 'cta',
}

/** Link click target types for analytics. */
export enum ClickTargetType {
  Github = 'github',
  LiveDemo = 'live_demo',
  ResumeDownload = 'resume_download',
  SocialLink = 'social_link',
  Contact = 'contact',
  External = 'external',
}

/** Entity types for polymorphic relations (tags, versions). */
export enum EntityType {
  BlogPost = 'blog_post',
  Project = 'project',
  ResearchPaper = 'research_paper',
  Page = 'page',
  Achievement = 'achievement',
  OpensourceContribution = 'opensource_contribution',
}

/** Navigation item location. */
export enum NavLocation {
  Header = 'header',
  Footer = 'footer',
  Both = 'both',
}

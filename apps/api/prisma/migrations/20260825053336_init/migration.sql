-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'published', 'scheduled', 'archived', 'disabled');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video', 'pdf', 'document', 'other');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('personal', 'freelance', 'academic', 'professional', 'open_source');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('in_progress', 'completed', 'on_hold', 'abandoned');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('education', 'job', 'project', 'achievement', 'milestone');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('unread', 'read', 'replied', 'archived');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('text', 'markdown', 'image', 'project_list', 'blog_list', 'stats', 'cta');

-- CreateEnum
CREATE TYPE "ClickTargetType" AS ENUM ('github', 'live_demo', 'resume_download', 'social_link', 'contact', 'external');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('blog_post', 'project', 'research_paper', 'page', 'achievement', 'opensource_contribution');

-- CreateEnum
CREATE TYPE "NavLocation" AS ENUM ('header', 'footer', 'both');

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" VARCHAR(500),
    "caption" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" TEXT,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authors" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "avatar_id" TEXT,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "user_agent" TEXT,
    "ip_address" INET,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "group" VARCHAR(50) NOT NULL DEFAULT 'general',
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_sections" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "seo_title" VARCHAR(200),
    "seo_description" VARCHAR(500),
    "seo_keywords" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "og_image_id" TEXT,

    CONSTRAINT "about_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),
    "proficiency" SMALLINT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "role" VARCHAR(200) NOT NULL,
    "location" VARCHAR(200),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "company_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "company_logo_id" TEXT,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" TEXT NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "degree" VARCHAR(200) NOT NULL,
    "field_of_study" VARCHAR(200),
    "location" VARCHAR(200),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "grade" VARCHAR(50),
    "description" TEXT,
    "activities" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "institution_logo_id" TEXT,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "issuing_organization" VARCHAR(200) NOT NULL,
    "issue_date" DATE NOT NULL,
    "expiry_date" DATE,
    "credential_id" VARCHAR(200),
    "credential_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "certificate_image_id" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "date" DATE,
    "issuer" VARCHAR(200),
    "url" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "image_id" TEXT,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "project_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "short_description" TEXT NOT NULL,
    "content" TEXT,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "github_url" TEXT,
    "live_url" TEXT,
    "project_type" "ProjectType" NOT NULL DEFAULT 'personal',
    "project_status" "ProjectStatus" NOT NULL DEFAULT 'completed',
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE,
    "end_date" DATE,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "seo_title" VARCHAR(200),
    "seo_description" VARCHAR(500),
    "seo_keywords" VARCHAR(500),
    "published_at" TIMESTAMPTZ,
    "scheduled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "author_id" TEXT NOT NULL,
    "category_id" TEXT,
    "cover_image_id" TEXT,
    "og_image_id" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "project_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "reading_time_minutes" SMALLINT,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" VARCHAR(200),
    "seo_description" VARCHAR(500),
    "seo_keywords" VARCHAR(500),
    "published_at" TIMESTAMPTZ,
    "scheduled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "author_id" TEXT NOT NULL,
    "category_id" TEXT,
    "cover_image_id" TEXT,
    "og_image_id" TEXT,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_papers" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "abstract" TEXT,
    "content" TEXT,
    "doi" VARCHAR(200),
    "publication_url" TEXT,
    "publication_name" VARCHAR(200),
    "publication_date" DATE,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" VARCHAR(200),
    "seo_description" VARCHAR(500),
    "seo_keywords" VARCHAR(500),
    "published_at" TIMESTAMPTZ,
    "scheduled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "author_id" TEXT NOT NULL,
    "pdf_id" TEXT,
    "og_image_id" TEXT,

    CONSTRAINT "research_papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_tags" (
    "id" TEXT NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "entity_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200),
    "description" TEXT,
    "category" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "media_id" TEXT NOT NULL,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "version_label" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "file_id" TEXT NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" TEXT NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "url" TEXT NOT NULL,
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opensource_contributions" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "role" VARCHAR(100),
    "stars" INTEGER,
    "forks" INTEGER,
    "language" VARCHAR(50),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "opensource_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "event_type" "TimelineEventType" NOT NULL,
    "date" DATE NOT NULL,
    "end_date" DATE,
    "icon" VARCHAR(50),
    "url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "content" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "is_nav_visible" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "seo_title" VARCHAR(200),
    "seo_description" VARCHAR(500),
    "seo_keywords" VARCHAR(500),
    "published_at" TIMESTAMPTZ,
    "scheduled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "og_image_id" TEXT,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_sections" (
    "id" TEXT NOT NULL,
    "section_key" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "block_type" "BlockType" NOT NULL,
    "title" VARCHAR(200),
    "content" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "page_id" TEXT,
    "homepage_section_id" TEXT,
    "media_id" TEXT,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "ip_address" INET NOT NULL,
    "user_agent" TEXT,
    "browser" VARCHAR(100),
    "browser_version" VARCHAR(50),
    "os" VARCHAR(100),
    "os_version" VARCHAR(50),
    "device_type" VARCHAR(50),
    "screen_width" INTEGER,
    "screen_height" INTEGER,
    "language" VARCHAR(20),
    "timezone" VARCHAR(100),
    "country" VARCHAR(100),
    "region" VARCHAR(100),
    "city" VARCHAR(100),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "referrer" TEXT,
    "referrer_source" VARCHAR(100),
    "utm_source" VARCHAR(200),
    "utm_medium" VARCHAR(200),
    "utm_campaign" VARCHAR(200),
    "first_visited_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_visited_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visit_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(300),
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'unread',
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ,
    "replied_at" TIMESTAMPTZ,
    "visitor_id" TEXT,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "template_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "subject" VARCHAR(300) NOT NULL,
    "body_html" TEXT NOT NULL,
    "body_text" TEXT,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guestbook_entries" (
    "id" TEXT NOT NULL,
    "author_name" VARCHAR(100) NOT NULL,
    "author_email" VARCHAR(255),
    "message" TEXT NOT NULL,
    "moderation_status" "ModerationStatus" NOT NULL DEFAULT 'pending',
    "ip_address" INET,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderated_at" TIMESTAMPTZ,

    CONSTRAINT "guestbook_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "author_name" VARCHAR(200) NOT NULL,
    "author_title" VARCHAR(200),
    "author_company" VARCHAR(200),
    "content" TEXT NOT NULL,
    "url" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "author_avatar_id" TEXT,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_items" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "location" "NavLocation" NOT NULL DEFAULT 'header',
    "is_external" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "nav_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(200),
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_token" VARCHAR(255),
    "unsubscribed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "title" VARCHAR(300),
    "referrer" TEXT,
    "duration_seconds" INTEGER,
    "viewed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitor_id" TEXT NOT NULL,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_clicks" (
    "id" TEXT NOT NULL,
    "target_type" "ClickTargetType" NOT NULL,
    "target_url" TEXT NOT NULL,
    "source_path" VARCHAR(500),
    "clicked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitor_id" TEXT,

    CONSTRAINT "link_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "change_summary" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" TEXT,
    "details" JSONB,
    "ip_address" INET,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authors_username_key" ON "authors"("username");

-- CreateIndex
CREATE UNIQUE INDEX "authors_email_key" ON "authors"("email");

-- CreateIndex
CREATE INDEX "idx_sessions_author_id" ON "sessions"("author_id");

-- CreateIndex
CREATE INDEX "idx_sessions_expires_at" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "about_sections_slug_key" ON "about_sections"("slug");

-- CreateIndex
CREATE INDEX "idx_about_sections_sort" ON "about_sections"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_name_key" ON "skill_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_slug_key" ON "skill_categories"("slug");

-- CreateIndex
CREATE INDEX "idx_skill_categories_sort" ON "skill_categories"("sort_order");

-- CreateIndex
CREATE INDEX "idx_skills_category_id" ON "skills"("category_id");

-- CreateIndex
CREATE INDEX "idx_skills_sort" ON "skills"("category_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "skills_category_id_slug_key" ON "skills"("category_id", "slug");

-- CreateIndex
CREATE INDEX "idx_experiences_sort" ON "experiences"("sort_order");

-- CreateIndex
CREATE INDEX "idx_education_sort" ON "education"("sort_order");

-- CreateIndex
CREATE INDEX "idx_certificates_sort" ON "certificates"("sort_order");

-- CreateIndex
CREATE INDEX "idx_achievements_sort" ON "achievements"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "project_categories_name_key" ON "project_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "project_categories_slug_key" ON "project_categories"("slug");

-- CreateIndex
CREATE INDEX "idx_projects_status" ON "projects"("status");

-- CreateIndex
CREATE INDEX "idx_projects_published_at" ON "projects"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_projects_author_id" ON "projects"("author_id");

-- CreateIndex
CREATE INDEX "idx_projects_category_id" ON "projects"("category_id");

-- CreateIndex
CREATE INDEX "idx_projects_project_type" ON "projects"("project_type");

-- CreateIndex
CREATE UNIQUE INDEX "projects_author_id_slug_key" ON "projects"("author_id", "slug");

-- CreateIndex
CREATE INDEX "idx_project_images_project_id" ON "project_images"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_images_project_id_media_id_key" ON "project_images"("project_id", "media_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_name_key" ON "blog_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "idx_blog_posts_status" ON "blog_posts"("status");

-- CreateIndex
CREATE INDEX "idx_blog_posts_published_at" ON "blog_posts"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_blog_posts_author_id" ON "blog_posts"("author_id");

-- CreateIndex
CREATE INDEX "idx_blog_posts_category_id" ON "blog_posts"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_author_id_slug_key" ON "blog_posts"("author_id", "slug");

-- CreateIndex
CREATE INDEX "idx_research_papers_status" ON "research_papers"("status");

-- CreateIndex
CREATE INDEX "idx_research_papers_published_at" ON "research_papers"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_research_papers_author_id" ON "research_papers"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_papers_author_id_slug_key" ON "research_papers"("author_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "idx_entity_tags_entity" ON "entity_tags"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_entity_tags_tag_id" ON "entity_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "entity_tags_tag_id_entity_type_entity_id_key" ON "entity_tags"("tag_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_social_links_sort" ON "social_links"("sort_order");

-- CreateIndex
CREATE INDEX "idx_timeline_events_date" ON "timeline_events"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "idx_pages_status" ON "pages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_sections_section_key_key" ON "homepage_sections"("section_key");

-- CreateIndex
CREATE INDEX "idx_homepage_sections_sort" ON "homepage_sections"("sort_order");

-- CreateIndex
CREATE INDEX "idx_content_blocks_page_id" ON "content_blocks"("page_id");

-- CreateIndex
CREATE INDEX "idx_content_blocks_homepage_section_id" ON "content_blocks"("homepage_section_id");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_session_id_key" ON "visitors"("session_id");

-- CreateIndex
CREATE INDEX "idx_visitors_first_visited" ON "visitors"("first_visited_at" DESC);

-- CreateIndex
CREATE INDEX "idx_visitors_country" ON "visitors"("country");

-- CreateIndex
CREATE INDEX "idx_contact_submissions_status" ON "contact_submissions"("status");

-- CreateIndex
CREATE INDEX "idx_contact_submissions_created_at" ON "contact_submissions"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_template_key_key" ON "email_templates"("template_key");

-- CreateIndex
CREATE INDEX "idx_guestbook_entries_moderation" ON "guestbook_entries"("moderation_status");

-- CreateIndex
CREATE INDEX "idx_testimonials_sort" ON "testimonials"("sort_order");

-- CreateIndex
CREATE INDEX "idx_nav_items_sort" ON "nav_items"("location", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "idx_page_views_visitor_id" ON "page_views"("visitor_id");

-- CreateIndex
CREATE INDEX "idx_page_views_path" ON "page_views"("path");

-- CreateIndex
CREATE INDEX "idx_page_views_viewed_at" ON "page_views"("viewed_at" DESC);

-- CreateIndex
CREATE INDEX "idx_link_clicks_visitor_id" ON "link_clicks"("visitor_id");

-- CreateIndex
CREATE INDEX "idx_link_clicks_target_type" ON "link_clicks"("target_type");

-- CreateIndex
CREATE INDEX "idx_link_clicks_clicked_at" ON "link_clicks"("clicked_at" DESC);

-- CreateIndex
CREATE INDEX "idx_content_versions_entity" ON "content_versions"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_versions_entity_type_entity_id_version_key" ON "content_versions"("entity_type", "entity_id", "version");

-- CreateIndex
CREATE INDEX "idx_activity_log_author_id" ON "activity_log"("author_id");

-- CreateIndex
CREATE INDEX "idx_activity_log_created_at" ON "activity_log"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_activity_log_entity" ON "activity_log"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_sections" ADD CONSTRAINT "about_sections_og_image_id_fkey" FOREIGN KEY ("og_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "skill_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_company_logo_id_fkey" FOREIGN KEY ("company_logo_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_institution_logo_id_fkey" FOREIGN KEY ("institution_logo_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_certificate_image_id_fkey" FOREIGN KEY ("certificate_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "project_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_og_image_id_fkey" FOREIGN KEY ("og_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_og_image_id_fkey" FOREIGN KEY ("og_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_papers" ADD CONSTRAINT "research_papers_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_papers" ADD CONSTRAINT "research_papers_pdf_id_fkey" FOREIGN KEY ("pdf_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_papers" ADD CONSTRAINT "research_papers_og_image_id_fkey" FOREIGN KEY ("og_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_tags" ADD CONSTRAINT "entity_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_og_image_id_fkey" FOREIGN KEY ("og_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_homepage_section_id_fkey" FOREIGN KEY ("homepage_section_id") REFERENCES "homepage_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_author_avatar_id_fkey" FOREIGN KEY ("author_avatar_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nav_items" ADD CONSTRAINT "nav_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "nav_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_clicks" ADD CONSTRAINT "link_clicks_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

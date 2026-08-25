# Changelog

> Record of all significant changes to the project.
> Most recent changes first.

---

## 2025-08-25

### Phase 3: Backend Infrastructure & Core Services

#### Added: Security, Middleware & Logging (`apps/api/src/`)

- `config/logger.ts` — Pino structured logger with pretty output in development.
- `config/constants.ts` — JWT TTLs, upload limits, rate-limit windows, email retry settings.
- `middleware/requestId.middleware.ts` — `x-request-id` correlation ID on every request.
- `middleware/requestLogger.middleware.ts` — `pino-http` request/response logging.
- `middleware/rateLimit.middleware.ts` — Strict, analytics, and public rate limiters.
- `middleware/validate.middleware.ts` — Shared Zod validation (`validateBody`, `validateQuery`, `validateParams`).
- `middleware/auth.middleware.ts` — `authenticateAdmin` JWT guard.
- Extended `config/env.ts` — SMTP, Cloudinary, storage provider, upload dir, API public URL.

#### Added: Authentication Engine

- `services/token.service.ts` — HS256 access (15 min) and refresh (7 day) JWT signing/verification.
- `services/auth.service.ts` — Login, refresh rotation, logout with SHA-256 hashed refresh tokens in `sessions`.
- `controllers/auth.controller.ts`, `routes/auth.route.ts` — `POST /auth/login`, `/refresh`, `/logout`, `GET /auth/me`.

#### Added: Media Pipeline

- `storage/` — `StorageAdapter` interface with `LocalStorageAdapter` and `CloudinaryStorageAdapter`.
- `services/media.service.ts` — Multer upload, MIME allowlist, image dimensions via `image-size`, `media` table persistence.
- `routes/media.route.ts` — `POST /api/v1/media` (admin-only multipart upload).

#### Added: Visitor Telemetry Engine

- `services/geo.service.ts` — ip-api geolocation with timeout, in-memory cache, fail-open.
- `services/tracker.service.ts` — Session upsert, page views, link clicks; respects `analytics_enabled` setting.
- `routes/analytics.route.ts` — `POST /analytics/session`, `/view`, `/click`.

#### Added: Email & Contact Service

- `services/email.service.ts` — Nodemailer SMTP with 3-retry backoff, Mustache template rendering from `email_templates`.
- `services/contact.service.ts` — Persist contact submissions, dispatch auto-reply + admin notification emails.
- `routes/contact.route.ts` — `POST /api/v1/contact` with strict rate limiting.

#### Updated: Shared Contracts (`packages/shared/src/`)

- `constants/index.ts` — Added `RATE_LIMITED` error code and `EMAIL_TEMPLATE_KEYS`.
- `schemas/media.ts` — Upload metadata schema (`altText`, `caption`).
- `schemas/interaction.ts` — Optional `sessionId` on contact form for visitor linking.

---

### Phase 2: Data Layer, Prisma Schema, Seeds & Shared Contracts

#### Added: Prisma Database Layer (`apps/api/prisma/`)

- `schema.prisma` — Complete 38-table, 11-enum PostgreSQL schema matching `DATABASE_SCHEMA.md` with relations, cascading rules, and lookup indexes.
- `prisma.config.ts` — Prisma 7 configuration with environment-driven datasource URL and seed command.
- `prisma/migrations/20260825053336_init/` — Initial database migration applied to PostgreSQL.
- `prisma/seed.ts` — Comprehensive database seed populating default admin author (`anuj`), site settings, homepage sections, navigation menus, about sections, email templates, skill categories & skills, sample project, blog post, research paper, social links, dynamic pages (`/now`, `/uses`, `/stack`), and timeline events.
- `src/config/prisma.ts` — Centralized Prisma client instance with `@prisma/adapter-pg` driver adapter.

#### Added: Shared Contracts Expansion (`packages/shared/src/`)

- `types/` — Domain-organized TypeScript interfaces and DTOs:
  - `enums.ts` — 11 enum definitions mirroring database enums.
  - `common.ts` — `PaginatedResponse<T>`, `PaginationMeta`, `ApiErrorResponse`, `SortOrder`, `SeoFields`.
  - `author.ts` — `AuthorDto`, `AuthResponse`, `LoginRequest`, `RefreshTokenRequest`.
  - `project.ts` — `ProjectDto`, `ProjectListItemDto`, `CreateProjectRequest`, `UpdateProjectRequest`, `ProjectCategoryDto`.
  - `blog.ts` — `BlogPostDto`, `BlogPostListItemDto`, `CreateBlogPostRequest`, `UpdateBlogPostRequest`, `BlogCategoryDto`.
  - `research.ts` — `ResearchPaperDto`, `ResearchPaperListItemDto`, `CreateResearchPaperRequest`, `UpdateResearchPaperRequest`.
  - `profile.ts` — DTOs for about sections, skills, categories, experiences, education, certificates, achievements, timeline events, resumes, social links, open-source contributions.
  - `site.ts` — DTOs for site settings, homepage sections, content blocks, navigation items, dynamic pages.
  - `interaction.ts` — DTOs for contact submissions, guestbook entries, testimonials, newsletter subscriptions.
  - `analytics.ts` — DTOs for visitor sessions, page views, link click events.
  - `media.ts` — `MediaDto`.
- `schemas/` — Domain-organized Zod validation schemas:
  - `common.ts` — `paginationSchema`, `slugSchema`, `seoFieldsSchema`, `uuidParamSchema`.
  - `auth.ts` — `loginSchema`, `refreshTokenSchema`.
  - `project.ts` — `createProjectSchema`, `updateProjectSchema`, `listProjectsQuerySchema`.
  - `blog.ts` — `createBlogPostSchema`, `updateBlogPostSchema`, `listBlogPostsQuerySchema`.
  - `research.ts` — `createResearchPaperSchema`, `updateResearchPaperSchema`, `listResearchPapersQuerySchema`.
  - `profile.ts` — CRUD schemas for about sections, skills, categories, experiences, education, certificates, achievements, timeline, social links.
  - `site.ts` — CRUD schemas for site settings, homepage sections, content blocks, nav items, pages.
  - `interaction.ts` — Schemas for contact form, guestbook entries, newsletter subscriptions.
  - `analytics.ts` — Schemas for session registration, page views, link clicks.
- `constants/` — Domain constants: `DEFAULT_HOMEPAGE_SECTIONS`, `SITE_SETTING_KEYS`, `AVAILABILITY_STATUSES`, `CONTENT_LIMITS`.

---

### Roadmap Planning & Master Blueprint

#### Added: Master Detailed Roadmap

- [docs/DETAILED_ROADMAP.md](DETAILED_ROADMAP.md) — Comprehensive 10-phase implementation plan covering database schemas, backend services, frontend pages, admin CMS, telemetry tracker, SEO, and deployment.
- [BASE_ROADMAP.md](../BASE_ROADMAP.md) — Updated root roadmap summary referencing the detailed plan.

---

### Phase 1: Monorepo & Project Initialization

#### Added: Root workspace configuration

- `README.md` — Project root guide, setup instructions, scripts, and documentation links
- `package.json` — npm workspaces (`apps/*`, `packages/*`), root dev scripts
- `tsconfig.base.json` — shared strict TypeScript config
- `.prettierrc` — code formatting (single quotes, trailing commas, 100 char width)
- `.gitignore` — Node.js + Next.js + Prisma ignores
- `.env.example` — all environment variables documented

#### Added: Backend (`apps/api/`)

- Express + TypeScript + Helmet + CORS
- Zod-validated environment config (`src/config/env.ts`)
- Custom error classes: `AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`
- Centralized error handler middleware
- Health check endpoint: `GET /api/v1/health`
- Folder stubs for controllers, services, repositories, prisma

#### Added: Frontend (`apps/web/`)

- Next.js 16.3 (App Router) + TypeScript + Tailwind CSS v4
- Full design token system in `globals.css` (`:root` dark + `.light` themes, `@theme inline` for Tailwind v4)
- Geist Variable font loaded via `next/font`
- `cn()` utility (clsx + tailwind-merge)
- Folder stubs for components/ui, components/layout, hooks, lib

#### Added: Shared package (`packages/shared/`)

- `ContentStatus` enum, pagination types, API error response types
- Pagination Zod schema
- Error code and pagination default constants

#### Updated: `ARCHITECTURE_RULES.md`

- Project structure diagram now shows `src/` directory inside `apps/web/`
- Added `docs/` folder to structure diagram

---

### Docs Reorganization

#### Moved: All documentation into `docs/` folder

- All 16 MD files moved from project root to `docs/`
- Created [docs/README.md](README.md) — documentation index with categorized navigation
- Updated CONTEXT.md to reflect new location

---

### Documentation & Architecture Phase

#### Added: Engineering Standards (8 files)

- [PROJECT_GUIDELINES.md](PROJECT_GUIDELINES.md) — Core development principles, dynamic content rules, no-hardcoding policy
- [AGENT_RULES.md](AGENT_RULES.md) — AI agent rules for consistent codebase contributions
- [CODING_STANDARDS.md](CODING_STANDARDS.md) — Naming conventions, TypeScript practices, API format, error handling
- [ARCHITECTURE_RULES.md](ARCHITECTURE_RULES.md) — Project structure, backend layering, dynamic content patterns
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Visual design guidelines derived from DARK_DESIGN.md and LIGHT_DESIGN.md
- [DESIGN_TOKENS.md](DESIGN_TOKENS.md) — Semantic token definitions (colors, typography, spacing, motion)
- [TAILWIND_GUIDELINES.md](TAILWIND_GUIDELINES.md) — Tailwind CSS configuration and usage rules
- [CSS_TOKENS.md](CSS_TOKENS.md) — CSS custom property implementation and global styles

#### Added: Database Schema

- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — Complete PostgreSQL schema: 38 tables, 12 enums, full CREATE TABLE SQL, indexes, constraints, ER relationships

#### Added: Project Context & Changelog

- [CONTEXT.md](CONTEXT.md) — Living context document for AI agents and contributors
- [CHANGELOG.md](CHANGELOG.md) — This file

#### Fixed: Light Theme Color

- [LIGHT_DESIGN.md](LIGHT_DESIGN.md) — Fixed `color.surface.base` from `#000000` (copy error from dark theme) to `#faf8f5` (warm off-white)

---

## Pre-existing Documentation

These files existed before the project was initialized and serve as the original requirements:

- [FEATURES_LIST.md](FEATURES_LIST.md) — 44 documented features across 11 categories
- [URL_IDEAS.md](URL_IDEAS.md) — Public and admin URL/route architecture
- [TECH_STACK.md](TECH_STACK.md) — Technology stack decisions
- [DARK_DESIGN.md](DARK_DESIGN.md) — Dark theme design tokens and component rules
- [LIGHT_DESIGN.md](LIGHT_DESIGN.md) — Light theme design tokens and component rules

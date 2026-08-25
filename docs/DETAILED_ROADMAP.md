# Master Detailed Roadmap — Anuj Yadav Portfolio Platform

> Complete end-to-end implementation blueprint for the dynamic portfolio and CMS platform.
> Stack: Next.js 16 (App Router) · Express.js · TypeScript · PostgreSQL · Prisma · Tailwind CSS v4 · TanStack Query

---

## 📌 Executive Summary & Architecture Overview

The goal is to build an **ultra-premium, dynamic, database-driven developer portfolio and content management platform**. Unlike static portfolios, every piece of content, navigation link, homepage section, and interactive feature is managed via a dedicated admin panel and served via a modular REST API.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (apps/web)                             │
│  - Next.js 16 App Router (React 19, Server & Client Components)        │
│  - Tailwind CSS v4 + Design Tokens (CSS Custom Properties)             │
│  - TanStack Query (Data Fetching, Caching, Optimistic UI)              │
│  - Public Portal: Works, Blogs, Research, Dynamic About, Command Palette│
│  - Admin CMS: Content Editors, Media Library, Layout Builder, Analytics│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST API (/api/v1)
┌───────────────────────────────────┴────────────────────────────────────┐
│                        BACKEND (apps/api)                              │
│  - Node.js & Express (TypeScript, Strict Mode)                         │
│  - Layered Architecture: Route → Controller → Service → Repository     │
│  - Auth & Security: JWT (Access + Refresh Rotation), Helmet, Rate Limit │
│  - Telemetry: High-accuracy Visitor Tracker & Link Analytics Engine    │
│  - Communications: SMTP Email Dispatcher & Dynamic Template Renderer   │
│  - Media Service: Centralized Asset Management & Storage Adapter       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Prisma ORM
┌───────────────────────────────────┴────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                              │
│  - 38 Normalized Tables, 12 Enums, Strict Foreign Keys & Indexes       │
│  - Polymorphic Tagging, Content Versioning, JSONB Snapshots            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚦 Roadmap Phases Overview

| Phase        | Title                             | Focus Area                                                                     | Status       |
| ------------ | --------------------------------- | ------------------------------------------------------------------------------ | ------------ |
| **Phase 1**  | **Monorepo & Scaffolding**        | Workspace setup, tooling, initial API, Next.js baseline, tokens                | ✅ Completed |
| **Phase 2**  | **Data Layer & Shared Contracts** | Prisma schema (38 tables), DB migrations, seeds, shared Zod schemas/DTOs       | ⏳ Next      |
| **Phase 3**  | **Backend Infrastructure**        | Auth (JWT), security middleware, logging, media upload, email, tracker engine  | 📋 Planned   |
| **Phase 4**  | **Backend REST API Modules**      | Domain CRUD services, public endpoints, admin endpoints, search                | 📋 Planned   |
| **Phase 5**  | **Frontend UI & Data Layer**      | Design system primitives, TanStack Query client, Markdown/MDX engine, theme    | 📋 Planned   |
| **Phase 6**  | **Public Frontend Pages**         | Dynamic Homepage, Works, Blogs, Research, About, Dynamic Catch-All, Guestbook  | 📋 Planned   |
| **Phase 7**  | **Admin Dashboard & CMS**         | Auth gate, content editors, layout builder, media manager, analytics dashboard | 📋 Planned   |
| **Phase 8**  | **SEO, RSS, Feeds & Search**      | Dynamic sitemap, RSS feed, OpenGraph generation, JSON-LD, Command Palette      | 📋 Planned   |
| **Phase 9**  | **Testing, QA & Optimization**    | Unit/E2E tests, WCAG 2.2 AA audit, Lighthouse 95+, security hardening          | 📋 Planned   |
| **Phase 10** | **Deployment & CI/CD**            | Database provisioning, API deployment, Next.js deployment, GitHub Actions      | 📋 Planned   |

---

## 🛠️ Detailed Phase Breakdown

---

### **PHASE 1: Monorepo & Project Initialization** _(Completed)_

- [x] Root npm workspaces (`apps/web`, `apps/api`, `packages/shared`).
- [x] TypeScript base config (`tsconfig.base.json`), ESLint, Prettier, `.gitignore`, `.env.example`.
- [x] Express backend scaffolding with health route (`GET /api/v1/health`), custom error handling, and Zod env validator.
- [x] Next.js 16 App Router scaffolding with Tailwind CSS v4, Geist Variable font, and token-based `globals.css`.
- [x] Shared package `@portfolio/shared` with initial types and pagination schemas.
- [x] Root and docs indexing documentation.

---

### **PHASE 2: Data Layer, Prisma Schema, Seeds & Shared Contracts**

#### Objective:

Establish the complete PostgreSQL schema in Prisma, create database migration scripts, build comprehensive seed data, and define all shared TypeScript interfaces, DTOs, and Zod validation schemas.

#### 2.1 Prisma Schema Definition (`apps/api/prisma/schema.prisma`)

- Translate all 38 tables and 12 enums from `docs/DATABASE_SCHEMA.md`:
  1. **Enums:** `content_status`, `project_type`, `project_status`, `publication_type`, `skill_level`, `event_type`, `social_platform`, `media_type`, `inquiry_status`, `nav_location`, `block_type`, `admin_role`.
  2. **Core System Tables:** `authors`, `admin_users`, `sessions`, `site_settings`.
  3. **Content Tables:** `projects`, `project_technologies`, `project_images`, `blog_posts`, `research_papers`, `pages`, `content_blocks`, `content_versions`.
  4. **Profile & Experience Tables:** `about_sections`, `skills`, `skill_categories`, `experiences`, `education`, `certificates`, `achievements`, `timeline_events`, `resumes`, `social_links`.
  5. **Media & Taxonomy:** `media`, `tags`, `entity_tags`.
  6. **Layout & Navigation:** `homepage_sections`, `nav_items`.
  7. **Interactions & Feedback:** `contact_inquiries`, `email_templates`, `guestbook_entries`, `testimonials`, `newsletter_subscribers`.
  8. **Telemetry & Analytics:** `visitor_sessions`, `page_views`, `link_clicks`.
- Configure foreign key constraints, cascading delete rules, and compound search/lookup indexes (`slug`, `status`, `sort_order`, `created_at`).

#### 2.2 Database Migrations & Seeding (`apps/api/prisma/seed.ts`)

- Execute initial Prisma migration (`npx prisma migrate dev --name init`).
- Build comprehensive seed script:
  - Default Admin user (`anuj` / hashed credentials).
  - Author profile for Anuj Yadav (bio, avatar placeholder, social links).
  - Default `site_settings` (site title, SEO defaults, availability status).
  - Default `homepage_sections` with initial sort order and visibility.
  - Default `nav_items` for Header and Footer.
  - Initial dynamic `about_sections` (overview, skills, timeline, experience, education).
  - System `email_templates` (Contact confirmation auto-reply, Admin inquiry alert).
  - Sample projects, blog articles, research papers, and skills.

#### 2.3 Shared DTOs & Validation Schemas (`packages/shared/src`)

- **Types (`packages/shared/src/types/`):**
  - Export typed DTOs for every entity (e.g., `ProjectDto`, `BlogPostDto`, `AuthorDto`, `VisitorSessionDto`).
  - Request/Response models: `CreateProjectRequest`, `UpdateProjectRequest`, `ProjectListResponse`, `AuthResponse`, etc.
- **Zod Schemas (`packages/shared/src/schemas/`):**
  - Request payload schemas with strict validation rules (slug regex, string length, URLs, enum bindings).
  - Query parameter schemas (filtering by tag, category, status, pagination, sorting).

---

### **PHASE 3: Backend Infrastructure & Core Services (`apps/api`)**

#### Objective:

Construct resilient server foundations, authentication mechanisms, file handling, email services, and high-accuracy visitor analytics.

#### 3.1 Security, Middleware & Structured Logging

- Implement **Pino** structured logger with request correlation IDs (`x-request-id`).
- Rate limiting middleware (`express-rate-limit`) configured per endpoint class (strict on `/auth` & `/contact`, permissive on public GETs).
- Zod validation middleware (`validateBody`, `validateQuery`, `validateParams`) that returns standard 422 errors.

#### 3.2 Authentication & Authorization Engine

- **Password Security:** Argon2 or bcrypt password hashing.
- **JWT Token Service:**
  - Access Token (15-min lifespan, HS256).
  - Refresh Token (7-day lifespan, stored hashed in `sessions` table).
  - Token rotation on refresh; automatic revocation on logout.
- **Middleware:** `authenticateAdmin` guard verifying valid active session.

#### 3.3 Centralized Media Pipeline (`apps/api/src/services/media.service.ts`)

- Multer file upload handler supporting images (WEBP, PNG, JPG, SVG) and documents (PDF).
- Storage Adapter Pattern:
  - Local instance storage (development).
  - Cloudinary / S3-compatible Object Storage (production).
- Media record creation in `media` table with auto-computed dimensions, size, mime type, and alt text.

#### 3.4 High-Accuracy Visitor Telemetry Engine (`apps/api/src/services/tracker.service.ts`)

- **Visitor Fingerprinting:** Combine IP hash + User-Agent + Screen/Timezone metadata into a unique `visitor_sessions` record.
- **Geo-Location Resolver:** MaxMind GeoIP / ip-api lookup (Country, Region, City, Latitude, Longitude, ISP).
- **Telemetry Collector Endpoints:**
  - `POST /api/v1/analytics/session`: Registers or refreshes visitor session.
  - `POST /api/v1/analytics/view`: Records exact page view, route, referrer, time spent.
  - `POST /api/v1/analytics/click`: Records outbound link clicks (GitHub, Live demo, Resume download, Social links).

#### 3.5 Communications & Dynamic Email Service

- **Nodemailer SMTP Transporter** configured with retry logic.
- Dynamic Template Engine: Mustache / lightweight template compiler fetching HTML templates from `email_templates` table.
- Automatic email dispatch on contact form submission:
  1. _User Auto-Reply:_ Professional receipt acknowledgment.
  2. _Admin Alert:_ Instant notification with message details and visitor telemetry.

---

### **PHASE 4: Backend REST API Domain Modules**

#### Objective:

Implement the complete business logic and REST endpoints following the strict layered pattern: **Route → Controller → Service → Repository → Prisma**.

#### 4.1 Content Modules

- **Projects (`/api/v1/projects`):**
  - Public: List published projects (with category/tag/tech filters), Get project by author + slug (includes case study MDX, media, technologies).
  - Admin: Full CRUD, sort ordering, feature toggling, draft/publish lifecycle.
- **Blog Posts (`/api/v1/blog-posts`):**
  - Public: List published posts, Get by author + slug, filter by tag/category, reading time calculation.
  - Admin: Full CRUD, version snapshot creation on edit (`content_versions`), status scheduling.
- **Research Papers (`/api/v1/research-papers`):**
  - Public: List published research, get paper details, download linked PDF attachment.
  - Admin: CRUD, DOI management, publication metadata.
- **Dynamic Pages & Content Blocks (`/api/v1/pages`, `/api/v1/content-blocks`):**
  - Public: Fetch dynamic page by slug (`/now`, `/uses`, `/stack`, `/faq`, `/services`, etc.).
  - Admin: Create custom pages, inject reusable blocks (markdown, stats, callout, project list).

#### 4.2 Profile & Portfolio Modules

- **About Sections (`/api/v1/about-sections`):** Dynamic section hierarchy and content.
- **Skills (`/api/v1/skills`, `/api/v1/skill-categories`):** Grouped skills with proficiency, icon references, and category filters.
- **Experiences (`/api/v1/experiences`):** Employment history with responsibilities, technologies, and company logos.
- **Education (`/api/v1/education`):** Academic background, degree, coursework, awards.
- **Certificates & Achievements (`/api/v1/certificates`, `/api/v1/achievements`):** Credential verification links, badge images, competition awards.
- **Timeline Events (`/api/v1/timeline-events`):** Chronological journey events.
- **Resume Management (`/api/v1/resumes`):** List resume versions, download active public resume (`/api/v1/resumes/active/download`).
- **Social Links (`/api/v1/social-links`):** Manage active social profiles.

#### 4.3 Layout & Configuration Modules

- **Homepage Sections (`/api/v1/homepage-sections`):** Reorder, toggle visibility, and configure homepage modules dynamically.
- **Navigation (`/api/v1/nav-items`):** Header and footer dynamic menu hierarchy.
- **Site Settings (`/api/v1/site-settings`):** Global key-value store (site title, author availability, SEO defaults).

#### 4.4 Interactions & Moderation Modules

- **Contact Inquiries (`/api/v1/contact`):** Submit message, admin message inbox, mark read/archived.
- **Guestbook (`/api/v1/guestbook`):** Submit public entry, admin moderation queue (approve/reject), list approved entries.
- **Testimonials (`/api/v1/testimonials`):** Client and collaborator recommendations.
- **Newsletter (`/api/v1/newsletter`):** Public subscription, unsubscribe token handling, subscriber export.

#### 4.5 Global Search & Aggregations

- `GET /api/v1/search?q=query`: Fast multi-entity search across Projects, Blogs, Research, Skills, and Pages.
- `GET /api/v1/stats`: Public aggregated statistics (total projects, articles published, github activity, years experience).

#### 4.6 Scheduled Background Jobs

- Scheduled Post Publisher (cron checking `scheduled` content every 5 minutes).
- GitHub Stats Sync (nightly sync of stars and repository metadata).

---

### **PHASE 5: Frontend Design System Primitives & Client Infrastructure**

#### Objective:

Construct the UI component library, data fetching infrastructure, markdown rendering pipeline, and theme state management in `apps/web`.

#### 5.1 Typed API Client & TanStack Query Layer

- Create unified `apiClient` (`apps/web/src/lib/api.ts`) with automatic bearer token attachment, error normalization, and response typing.
- Setup `QueryClientProvider` with sensible stale times (5 min for public content, 0 for admin).
- Build reusable custom hooks for all domain entities (`useProjects`, `useBlogPosts`, `useSiteSettings`, `useAnalyticsTracker`).

#### 5.2 Accessible Design System Primitives (`apps/web/src/components/ui/`)

- Implement accessible, token-driven UI components with WCAG 2.2 AA compliance:
  - **Button:** Variants (`primary`, `secondary`, `ghost`, `destructive`, `outline`), Sizes (`sm`, `md`, `lg`), Loading state, Focus ring.
  - **Card:** Surface background, subtle border, hover elevation.
  - **Input & Textarea:** Focus-visible ring, error states, attached helper text.
  - **Badge & Tag:** Status badges, tech stack pills, category chips.
  - **Modal & Dialog:** Accessible focus trap, backdrop blur, `Escape` key listener.
  - **Dropdown & Popover:** Keyboard navigable floating menus.
  - **Tabs & Accordion:** Animated state transitions.
  - **Skeleton & Spinners:** Smooth pulse placeholder loaders.
  - **Toast Notification Provider:** Sonner / custom accessible toast queue.

#### 5.3 Rich Long-Form Markdown / MDX Engine (`apps/web/src/components/content/`)

- Markdown/MDX parser configured with:
  - Syntax highlighting for code blocks with line numbers and **Copy Code** button.
  - Auto-generated Table of Contents (TOC) with scroll-spy.
  - Custom callout boxes (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`).
  - Optimized responsive image renderer with zoom modal.

#### 5.4 Theme Switcher & System Preference Sync

- Theme Provider supporting `dark` (default), `light`, and `system`.
- Zero-flicker script in `layout.tsx` syncing `localStorage` and `prefers-color-scheme`.

---

### **PHASE 6: Public-Facing Application Pages (`apps/web/src/app`)**

#### Objective:

Build all public routes defined in `docs/URL_IDEAS.md`, ensuring mobile-first responsive design, fast performance, dynamic rendering, and automated telemetry tracking.

#### 6.1 Global Layout & Navigation Shell

- **Sticky Glassmorphism Header:** Dynamic nav items from API, theme toggle, Command Palette trigger button (`Ctrl+K`), Mobile menu sheet.
- **Footer:** Dynamic links, social icons, newsletter signup, copyright, live availability status indicator.
- **Global Skip Link:** "Skip to main content" for screen readers and keyboard users.
- **Client Telemetry Provider:** Automatically logs page views and outbound link clicks.

#### 6.2 Dynamic Homepage Engine (`/`)

- Renders modules according to the order and visibility fetched from `GET /api/v1/homepage-sections`:
  1. **Hero Section:** Introduction, dynamic availability badge, CTA buttons ("View Work", "Download Resume", "Contact").
  2. **Featured Projects:** Showcase of top pinned projects with live demo / case study links.
  3. **Skills Overview:** Categorized technical expertise pills.
  4. **Experience Highlights:** Brief career journey preview.
  5. **Latest Articles & Research:** Recent writing preview cards.
  6. **Interactive Contact CTA:** Quick inquiry form.

#### 6.3 Works & Projects Ecosystem

- `/works`: Filterable grid by Category, Technology, Year, Project Type (Personal, Open Source, Client).
- `/works/by/[author]`: Author-specific work showcase.
- `/works/by/[author]/[slug]`: In-depth project case study (Problem, Architecture, Challenges, Screenshots gallery, Live Demo/GitHub CTA).

#### 6.4 Blogs & Research Ecosystem

- `/blogs`: Article list with search bar, tag filtering, reading time estimates, and publish dates.
- `/blogs/by/[author]/[slug]`: Full blog post reader with TOC, share buttons, author bio, and related articles.
- `/research`: Academic and technical publications list with PDF download triggers and citation/DOI links.

#### 6.5 About & Journey Ecosystem

- `/about`: Overview introduction and hub.
- `/about/[section]`: Dynamic router for specific sub-sections (`/about/anuj`, `/about/skills`, `/about/timeline`, etc.).
- `/skills`: Dedicated full skill matrix with category breakdown and proficiency badges.
- `/my-timeline`: Interactive, filterable vertical journey timeline (Education, Career, Major Milestones).
- `/certificates-achievements`: Visual gallery of certifications (with credential verification links) and awards.

#### 6.6 Dynamic Generic Pages Catch-All (`/[slug]`)

- Dynamic route handler that resolves routes from the `pages` table (`/now`, `/uses`, `/stack`, `/reading`, `/bookmarks`, `/learning`, `/opensource`, `/talks`, `/services`, `/testimonials`, `/faq`, `/changelog`, `/stats`, `/recommendations`).
- Renders dynamic metadata, MDX content, and attached reusable content blocks.

#### 6.7 Interactive Pages

- `/contact`: Interactive form with real-time validation, status toast, direct contact info, and PGP/social links.
- `/resume`: Clean online resume viewer with direct PDF download button.
- `/guestbook`: Community message board with submission form, character limit, and moderated visitor comments.
- `/search`: Full-page search with instant keyboard navigation.

#### 6.8 Command Palette (`Ctrl/Cmd + K`)

- Modal overlay providing instant search & keyboard navigation across all projects, blog articles, pages, social links, and actions (toggle theme, copy email, download resume).

#### 6.9 Fallback & Error Pages

- `/404`: Custom retro/developer not-found screen with search input and quick navigational links.
- `/500` & `error.tsx`: Graceful recovery screen with error report trigger.

---

### **PHASE 7: Admin Panel & CMS Platform (`apps/web/src/app/admin`)**

#### Objective:

Deliver a fast, secure, beautiful administrative portal allowing complete management of all 44 portfolio features.

#### 7.1 Admin Layout & Authentication Gate

- `/admin/login`: Secure login with email/password, rate-limiting, and error feedback.
- `/admin` (Dashboard Home): Overview metrics cards (Total views, unique visitors, contact submissions, published projects, draft articles, quick actions).
- Collapsible sidebar navigation, breadcrumbs, user profile dropdown, and session expiration countdown.

#### 7.2 Content Management Workflows

- **Projects Manager (`/admin/works`):** Data table with filters, search, multi-select actions. Edit view with MDX split-pane editor, image uploader, technology tagger.
- **Blog & Research Manager (`/admin/blogs`, `/admin/research`):** Full editor with autosave drafts, slug generator, tag selector, SEO preview, and version restore.
- **Dynamic Pages & Content Blocks Manager (`/admin/pages`, `/admin/blocks`):** Manage custom `/slug` routes and assign reusable content blocks.

#### 7.3 Profile, Experience & Taxonomy Managers

- `/admin/profile`: Author information, bio, profile avatar, availability status.
- `/admin/skills`: Create/reorder skill categories and manage individual skills with icons.
- `/admin/experience` & `/admin/education`: Timeline builder with company logos and dates.
- `/admin/timeline`: Interactive timeline event manager.
- `/admin/certificates` & `/admin/achievements`: Credential links, issuance dates, certificate uploads.
- `/admin/resume`: Resume versions manager; set active public resume.
- `/admin/tags`: Tag taxonomy manager.

#### 7.4 Site Layout & Customization Center

- **Homepage Builder (`/admin/homepage`):** Drag-and-drop / sortable list to reorder homepage sections; toggle section visibility.
- **Navigation Builder (`/admin/navigation`):** Header and Footer menu tree editor.
- **Site Settings & SEO (`/admin/settings`, `/admin/seo`):** Global settings, meta defaults, social cards, analytics toggles.
- **Email Templates Manager (`/admin/emails`):** Live editor with preview for contact auto-replies and notifications.

#### 7.5 Centralized Media Library (`/admin/media`)

- Visual grid of uploaded assets (images, PDFs, documents).
- Multi-file drag-and-drop uploader with upload progress.
- Asset details modal: Alt text editor, copy public URL, view file size/dimensions, delete with safety checks.

#### 7.6 Inquiries & Community Moderation

- **Contact Messages (`/admin/contact`):** Inbox with unread indicators, message reader, search, reply status, and sender telemetry details.
- **Guestbook Moderation (`/admin/guestbook`):** Approve / Reject / Delete queue for visitor submissions.
- **Newsletter Subscribers (`/admin/newsletter`):** Subscriber list with CSV export.

#### 7.7 Visitor Analytics & Insights Dashboard (`/admin/analytics`)

- Visual charts (Recharts / Chart.js):
  - Daily/Weekly/Monthly traffic trends (views, unique sessions).
  - Geographic breakdown (interactive world map or country bar charts).
  - Top visited projects and most read articles.
  - Outbound link click tracker (GitHub clicks, resume downloads, live demos).
  - Device, browser, and OS breakdown.
  - Real-time visitor log feed.

---

### **PHASE 8: SEO, Syndication & Search Optimization**

#### Objective:

Ensure maximum discoverability, indexing, social sharing fidelity, and compliance with modern search standards.

#### 8.1 Automated XML Sitemap & Robots.txt

- Dynamic `/sitemap.xml` generated by querying published projects, blogs, research, pages, and dynamic about sections.
- Configurable `/robots.txt` honoring `site_settings`.

#### 8.2 RSS & Atom Syndication

- Dynamic `/feed.xml` containing latest published blog articles and research papers for RSS readers.

#### 8.3 Social Sharing & OpenGraph Generation

- Dynamic OpenGraph (`og:image`) generator for individual blog posts and projects using Next.js `@vercel/og` / edge image generation.
- JSON-LD Structured Data for `Person`, `BlogPosting`, `SoftwareApplication`, and `ScholarlyArticle`.

---

### **PHASE 9: Quality Assurance, Accessibility, Performance & Security**

#### Objective:

Validate complete system stability, accessibility, security, and sub-second load times.

#### 9.1 Testing Suite

- **Backend Unit & Integration Tests (Jest/Vitest + Supertest):** Test authentication, route validation, error handling, and domain services.
- **Frontend Component Tests:** Verify UI primitive accessibility and state handling.
- **End-to-End Tests (Playwright):** Critical paths (Public navigation, Contact submission, Admin login, Project creation).

#### 9.2 Accessibility & Usability Audit (WCAG 2.2 AA)

- Contrast ratio checks across both Dark and Light themes (minimum 4.5:1 for normal text).
- Full keyboard navigation testing (tab loops, focus visible rings, modal traps, ESC triggers).
- Screen reader audit (ARIA labels, landmark regions, image alt tags).

#### 9.3 Performance & Core Web Vitals Optimization

- Target **Lighthouse Score ≥ 95** across Performance, Accessibility, Best Practices, and SEO.
- Next.js Image optimization (`next/image`), font preloading (`next/font`), and efficient caching headers.

#### 9.4 Security Hardening

- SQL injection prevention via Prisma parameterization.
- XSS prevention via Markdown sanitization (DOMPurify).
- CSRF protection, secure HTTP-only cookies for refresh tokens, strict CORS whitelist.

---

### **PHASE 10: Production Deployment & CI/CD**

#### Objective:

Deploy the frontend, backend, and database to production infrastructure with automated CI/CD pipelines.

#### 10.1 Database Provisioning

- Provision PostgreSQL instance (Neon, Supabase, AWS RDS, or self-hosted).
- Run production migrations (`npx prisma migrate deploy`) and initial seed.

#### 10.2 Backend & Frontend Deployment

- **Backend:** Deploy Express API containerized (Docker) on Render, Railway, VPS, or AWS with SSL.
- **Frontend:** Deploy Next.js App to Vercel or Node.js server with environment variables linked to the production API.

#### 10.3 CI/CD Automation (GitHub Actions)

- Automated workflow triggering on pull requests and main branch pushes:
  1. Type-check across monorepo (`npm run build:shared`).
  2. Lint and format checks (`npm run lint`, `npm run format:check`).
  3. Run automated tests.
  4. Build check and automatic deployment trigger.

---

## 📈 Verification Checklist by Phase

```
Phase 2  →  DB tables created in PostgreSQL & 'npm run build:shared' passes with all DTOs.
Phase 3  →  Admin login issues JWT, file upload saves to media table, test email sends via SMTP.
Phase 4  →  All API routes respond with structured JSON, 422 on bad inputs, and respect content_status.
Phase 5  →  UI primitives render correctly in Dark and Light themes with accessible focus rings.
Phase 6  →  Public site navigates smoothly, homepage sections render dynamically, contact sends message.
Phase 7  →  Admin can create/edit projects, upload media, reorder homepage, and view visitor analytics.
Phase 8  →  /sitemap.xml and /feed.xml return valid XML, social share preview generates image.
Phase 9  →  Lighthouse score ≥ 95, zero WCAG violations, all tests pass.
Phase 10 →  Live production site active on custom domain with automated GitHub Actions CI/CD.
```

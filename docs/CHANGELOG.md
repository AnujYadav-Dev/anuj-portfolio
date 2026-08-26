# Changelog

> Record of all significant changes to the project.
> Most recent changes first.

---

## 2026-08-26

### Phase 9: Quality Assurance, Accessibility, Performance & Security

#### Added: Monorepo Testing Infrastructure (`vitest`, `@testing-library`, `supertest`, `@playwright/test`)

- `apps/api/vitest.config.mts` & `tests/setup.ts` — Vitest test runner configuration for Express backend with path aliases, isolated test suites, and environment loading.
- `apps/api/tests/helpers/testApp.ts` — Supertest test client wrapper and mock admin JWT generator for authorized fixtures.
- `apps/api/tests/unit/` (`token.service.test.ts`, `validate.middleware.test.ts`, `rateLimit.middleware.test.ts`) — Unit tests verifying JWT signing/verification, Zod request payload schema parsing with structured 422 error outputs, and rate limiting.
- `apps/api/tests/integration/` (`health.test.ts`, `auth.test.ts`, `content.test.ts`, `interactions.test.ts`, `search.test.ts`) — Integration test suite verifying HTTP routes, auth guards, published content scoping, guestbook moderation, and aggregate telemetry.
- `apps/web/vitest.config.mts` & `tests/setup.ts` — JSDOM test runner configuration with React testing library, matchMedia, IntersectionObserver, and router mocks.
- `apps/web/tests/components/` (`button.test.tsx`, `input.test.tsx`, `dialog.test.tsx`, `theme-toggle.test.tsx`, `badge.test.tsx`, `SkipLink.test.tsx`, `MarkdownRenderer.test.tsx`) — Unit and accessibility assertions for UI primitives, modal dialogs, theme switches, skip navigation, and markdown rendering.
- `playwright.config.ts` & `e2e/` (`public-flows.spec.ts`, `admin-flows.spec.ts`) — End-to-End test suite covering public portfolio navigation, command palette search, contact inquiry submission, admin route guarding, and dashboard access across Chromium, Firefox, WebKit, and Mobile Chrome.

#### Hardened: WCAG 2.2 AA Accessibility & Usability

- `apps/web/src/app/globals.css` — Calibrated `.light` theme token `--color-accent-foreground: #000000;` (7.9:1 contrast on `#ff8c42`) and text link contrast (`#c95600`, 4.6:1) for WCAG 2.2 AA compliance.
- `apps/web/src/components/ui/button.tsx` — Added `aria-busy` and disabled state synchronization during async mutation pending states.
- `apps/web/src/components/ui/input.tsx` & `textarea.tsx` — Added `aria-invalid`, `aria-describedby` linking to dynamic error message elements with `role="alert"`, and explicit label associations.
- `apps/web/src/components/ui/dialog.tsx` — Implemented Tab/Shift+Tab focus boundary trapping, `role="dialog"`, `aria-modal="true"`, and Escape key dismissal.
- `apps/web/src/components/layout/MobileNav.tsx` — Added `id="mobile-nav-drawer"`, `role="dialog"`, `aria-modal="true"`, and `Escape` key close listener.
- `apps/web/src/components/content/ZoomableImage.tsx` — Added `role="button"`, `tabIndex={0}`, accessible `aria-label`, and `Enter`/`Space` keyboard zoom triggers.
- `apps/web/src/components/layout/Header.tsx` — Added `role="banner"`, `<nav aria-label="Main Navigation">`, `aria-current="page"` on active routes, and `aria-expanded`/`aria-controls` on mobile drawer trigger.
- `apps/web/src/components/layout/Footer.tsx` — Added `role="contentinfo"` and explicit accessible label on newsletter subscription input.
- `apps/web/src/components/layout/CommandPalette.tsx` — Added ARIA combobox pattern (`role="combobox"`, `role="listbox"`, `role="option"`, `aria-selected`, `aria-controls`).

#### Hardened: Performance Optimization, Architecture & Security

- `apps/web/src/components/content/MarkdownRenderer.tsx` — Integrated `rehype-sanitize` with a strict element/attribute whitelist to neutralize XSS vectors (`<script>`, `<iframe>`, `javascript:` URLs).
- `apps/web/next.config.ts` — Configured image optimization remote patterns (Unsplash, Cloudinary, GitHub, Localhost), AVIF/WebP formats, `compress: true`, `reactStrictMode: true`, and security/caching response headers.
- `apps/api/src/index.ts` — Enhanced Helmet with `frameguard: { action: 'deny' }`, HSTS (`max-age=31536000`, preload), Referrer-Policy (`strict-origin-when-cross-origin`), and multi-origin CORS whitelist support.
- `apps/api/src/middleware/errorHandler.ts` — Added Prisma database error interceptors mapping `P2002` (unique constraint) to HTTP 409 `CONFLICT` and `P2025` to HTTP 404 `NOT_FOUND`.
- `apps/api/src/routes/health.route.ts` — Architecturally separated `/api/v1/health` (process liveness) and `/api/v1/health/ready` (PostgreSQL readiness).
- `playwright.config.ts` — Configured automated `webServer` lifecycle management with dev server reuse for self-contained multi-browser testing.
- `package.json` & `.gitignore` — Added root monorepo scripts (`npm run test`, `npm run test:api`, `npm run test:web`, `npm run test:e2e`, `npm run test:coverage`) and cleaned test report artifacts.

---

## 2026-08-26

### Phase 8: SEO, Syndication & Search Optimization

#### Added: Core SEO & Syndication Infrastructure (`apps/web/src/lib/`, `components/seo/`, `packages/shared/`)

- `packages/shared/src/types/site.ts` — Added `SiteSettingsMap` and `SyndicationFeedItem` interfaces.
- `apps/web/src/lib/server-api.ts` — Server-side data fetching module utilizing caching and revalidation for Server Components, dynamic Sitemap, Robots, and Feed generators.
- `apps/web/src/lib/seo.ts` — Centralized SEO utility composing standard Next.js `Metadata` and generating Schema.org JSON-LD structured data (`Person`, `WebSite`, `BlogPosting`, `SoftwareApplication`, `ScholarlyArticle`, `BreadcrumbList`).
- `apps/web/src/components/seo/JsonLd.tsx` — Reusable JSON-LD script component with safe JSON sanitization.

#### Added: Automated Discovery & Indexing (`apps/web/src/app/`)

- `app/sitemap.ts` — Dynamic `/sitemap.xml` generating standard XML sitemap for 16 core static routes and all published projects, blogs, research papers, dynamic pages, and about sections.
- `app/robots.ts` — Configurable `/robots.txt` honoring `site_settings.robots_indexing_enabled` and referencing the dynamic sitemap URL.
- `app/feed.xml/route.ts` — Dynamic RSS 2.0 XML syndication feed generator with Atom namespaces, CDATA descriptions, and published date ordering.
- `app/rss.xml/route.ts` — Standard `/rss.xml` redirect route handler.

#### Added: Edge OpenGraph Social Image Generation (`next/og`)

- `app/api/og/route.tsx` — Dynamic edge image generation endpoint rendering 1200x630 branded social cards with title, category badge, tagline, author avatar, and reading time.
- `app/opengraph-image.tsx` & `app/twitter-image.tsx` — Root social sharing cards for portfolio homepage.
- `app/(public)/blogs/[slug]/opengraph-image.tsx` — Dynamic route-level OG card for individual blog posts.
- `app/(public)/works/[slug]/opengraph-image.tsx` — Dynamic route-level OG card for project case studies.
- `app/(public)/research/[slug]/opengraph-image.tsx` — Dynamic route-level OG card for research publications.
- `app/(public)/[slug]/opengraph-image.tsx` — Dynamic route-level OG card for custom pages.

#### Refactored: Server Component Architecture & Public Route Metadata

- `app/layout.tsx` — Root layout metadata with base URL, title template (`%s | Anuj Yadav`), keywords, OpenGraph, Twitter card, and global `WebSite` and `Person` JSON-LD schemas.
- Converted all public route entrypoints (`page.tsx`) to Server Components exporting `generateMetadata` (or static `Metadata`) and embedding JSON-LD scripts:
  - Dynamic routes: `/blogs/[slug]`, `/blogs/by/[author]/[slug]`, `/works/[slug]`, `/works/by/[author]/[slug]`, `/research/[slug]`, `/about/[section]`, `/[slug]`.
  - Static routes: `/`, `/about`, `/works`, `/blogs`, `/research`, `/skills`, `/my-timeline`, `/certificates-achievements`, `/resume`, `/contact`, `/guestbook`, `/newsletter`, `/opensource`, `/stats`, `/testimonials`, `/search`.

---

## 2026-08-25

### Phase 7: Admin Panel & Content Management System (CMS) Platform

#### Added: Admin Layout & Security Infrastructure (`apps/web/src/app/(admin)/`, `components/admin/`)

- `components/admin/layout/AdminAuthProvider.tsx` & `useAdminAuth.ts` — Authentication state provider with active session monitoring, 15-minute token TTL countdown, and silent background token refresh.
- `components/admin/layout/AdminAuthGuard.tsx` — Client-side route protection redirecting unauthenticated visitors to `/admin/login`.
- `components/admin/layout/AdminSidebar.tsx` — Collapsible navigation sidebar organizing 24 distinct CMS routes across 5 domain groups (Overview, Content, Journey & Profile, Customization, Community & Telemetry).
- `components/admin/layout/AdminHeader.tsx` — Sticky top bar featuring dynamic route breadcrumbs, live session expiration countdown pill with one-click token extend, and author profile menu.
- `components/admin/layout/AdminLayoutShell.tsx` & `app/(admin)/layout.tsx` — Root shell managing sidebar collapse states and mobile responsive drawers for admin views.

#### Added: Reusable Admin UI Primitives (`apps/web/src/components/admin/ui/`)

- `AdminPageHeader.tsx` — Standardized page header with title, subtitle, and primary action buttons.
- `AdminDataTable.tsx` — Generic data table with live search filtering, custom slot filters, pagination, row click handlers, and empty/loading states.
- `MarkdownEditor.tsx` — Full-featured MDX/Markdown split editor with live preview toggle, formatting shortcuts toolbar, and sync scrolling.
- `MediaPickerModal.tsx` — Centralized media modal picker with category filtering, mime type restriction, and direct upload triggers.
- `SimpleChart.tsx` — Reusable SVG-based timeseries area charts and animated horizontal distribution bars for traffic analytics without heavy charting bundle weight.
- `ReorderableList.tsx` — Drag-and-drop / sortable list container for manual section ordering.
- `ConfirmDialog.tsx` & `StatusBadge.tsx` — Destructive action confirmations and consistent status indicator badges.

#### Added: Content Management & Editor Suite (`apps/web/src/app/(admin)/admin/`)

- `admin/login/page.tsx` — Admin authentication portal with email/password validation, rate-limiting handlers, and session persistence.
- `admin/page.tsx` — Dashboard overview featuring 4 metric KPI cards, 14-day SVG traffic trajectory area chart, recent contact inbox preview drawer, and quick-action shortcuts.
- `admin/works/` (`page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `ProjectEditorForm.tsx`) — Full project lifecycle editor with architecture case studies, technology tagger, live demo/repo URLs, and cover image picker.
- `admin/blogs/` (`page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `BlogEditorForm.tsx`) — Blog articles manager with slug generator, category/tag taxonomies, SEO metadata fields, and version snapshot restore modal.
- `admin/research/` (`page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `ResearchEditorForm.tsx`) — Academic publication manager with publication venue, publication date, abstract, and PDF attachment links.
- `admin/pages/` (`page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `PageEditorForm.tsx`) & `admin/blocks/page.tsx` — Dynamic route builder and reusable content block snippet catalog.

#### Added: Profile, Journey & Taxonomy Managers

- `admin/profile/page.tsx` — Public author profile updater and password change security manager.
- `admin/about/page.tsx` — About section narrative modules editor with custom ordering and slug keys.
- `admin/skills/page.tsx` — Technical skills matrix and category editor with proficiency sliders.
- `admin/experience/page.tsx` & `admin/education/page.tsx` — Work experience and academic degree history managers.
- `admin/timeline/page.tsx` — Milestone journey events editor with event type indicators.
- `admin/certificates/page.tsx` & `admin/achievements/page.tsx` — Accreditations and awards management with verification URLs.
- `admin/resume/page.tsx` — Resume/CV version management and active public resume switcher.
- `admin/tags/page.tsx` & `admin/social/page.tsx` — Tag taxonomy manager and external social link tree editor.
- `admin/opensource/page.tsx` & `admin/testimonials/page.tsx` & `admin/gallery/page.tsx` — Open source repos, recommendations, and visual showcase editors.

#### Added: Layout Customization, Centralized Media & Community Telemetry

- `admin/homepage/page.tsx` — Homepage section reordering and live visibility toggles.
- `admin/navigation/page.tsx` — Header navigation menu tree and external link customizer.
- `admin/settings/page.tsx` — Global site settings and telemetry flags bulk editor.
- `admin/seo/page.tsx` — SERP Google search snippet preview and social OpenGraph card previewer.
- `admin/emails/page.tsx` — Transactional email template editor with live HTML preview and variable tags.
- `admin/media/page.tsx` — Media library with multi-file drag-and-drop dropzone, file metadata inspector, and direct URL copy.
- `admin/contact/page.tsx` — Inquiries inbox with message reader drawer, read/replied status, and sender telemetry details.
- `admin/guestbook/page.tsx` — Visitor guestbook moderation queue with approve, reject, pin, and spam purge.
- `admin/newsletter/page.tsx` — Subscriber list with status filtering and CSV export.
- `admin/analytics/page.tsx` — Comprehensive visitor telemetry dashboard with time range selector, traffic trajectory, breakdown distributions (countries, referrers, devices, browsers), top pages table, outbound clicks stats, and live visitor log feed.

---

### Phase 6: Public-Facing Application Pages & Navigation

#### Added: Global Layout Shell, Navigation & Telemetry (`apps/web/src/components/layout/`, `app/(public)/`)

- `components/layout/SkipLink.tsx` — Accessible skip link for keyboard navigation.
- `components/layout/TelemetryTracker.tsx` — Headless analytics component sending page view and click telemetry to `/api/v1/analytics/collect`.
- `components/layout/CommandPalette.tsx` — Global overlay modal (`Ctrl+K` / `Cmd+K`) supporting instant full-text search, direct route navigation, theme switching, email copy, and resume download.
- `components/layout/MobileNav.tsx` — Responsive sliding navigation drawer with dynamic navigation items, social links, theme toggle, and resume CTA.
- `components/layout/Header.tsx` — Sticky glassmorphism header with logo watermark `ANUJ.Y`, dynamic navigation links, command palette search trigger, theme toggle, and mobile drawer hamburger.
- `components/layout/Footer.tsx` — Global footer with giant watermark typography `ANUJ YADAV`, live availability indicator, dynamic social links, copyright, and newsletter subscription form.
- `components/common/SplitSection.tsx` & `PageHeader.tsx` — Split 2-column framing component (left 30% label, right 70% stream) and consistent sub-page headers.
- `app/(public)/layout.tsx` — Public route group shell wrapping all public portfolio pages.

#### Added: Dynamic Homepage Engine (`apps/web/src/components/features/home/`, `app/(public)/page.tsx`)

- `HeroSection.tsx` — Headline tagline, dynamic availability badge, CTA links with warm orange underlines, and bottom giant watermark `FULL STACK ENGINEER`.
- `AboutPreview.tsx` — Split 2-column narrative overview with warm orange highlighted phrases and quick jump to `/about`.
- `WorksBento.tsx` — Bento grid pairing live monospace terminal verbs on the left with a featured project case study on the right.
- `SkillsOverview.tsx` — Categorized technical skill pills with discipline grouping.
- `ExperienceHighlights.tsx` — Career journey preview highlighting recent roles and achievements.
- `LatestBlogsSection.tsx` — Expandable blog post rows with hover previews, reading times, and publication dates.
- `ContactCTA.tsx` — Bottom inquiry callout with direct message prompt and one-click email copy.
- `app/(public)/page.tsx` — Dynamic homepage page resolving section order dynamically from `useHomepageSections()`.

#### Added: Works & Projects Ecosystem (`apps/web/src/app/(public)/works/`, `components/features/works/`)

- `ProjectCard.tsx` — Rich project card with thumbnail preview, category badge, tech tags, and case study links.
- `ProjectFilters.tsx` — Interactive filter bar supporting live search, category pill switching, and tag selection.
- `ProjectCaseStudy.tsx` — Deep case study reader featuring metadata matrix, live demo/source links, zoomable interface screenshots, and rendered markdown architecture notes.
- Routes: `/works`, `/works/[slug]`, `/works/by/[author]`, `/works/by/[author]/[slug]`.

#### Added: Blogs & Research Ecosystem (`apps/web/src/app/(public)/blogs/`, `research/`, `components/features/blogs/`, `research/`)

- `BlogListRow.tsx` — Expandable article list rows with hover details and reading times.
- `BlogReader.tsx` — Long-form reading experience featuring squircle mosaic backdrop header, sticky table of contents sidebar with scroll-spy, share actions, and author bio card.
- `ResearchPaperCard.tsx` — Academic paper card with conference/journal badge, abstract, DOI link, and PDF download action.
- Routes: `/blogs`, `/blogs/[slug]`, `/blogs/by/[author]`, `/blogs/by/[author]/[slug]`, `/research`, `/research/[slug]`.

#### Added: Profile, Journey & Interactive Public Hubs (`apps/web/src/app/(public)/`, `components/features/`)

- `about/TimelineList.tsx` & `/my-timeline` — Chronological journey milestone viewer grouped by year with event type badges.
- `about/SkillsMatrix.tsx` & `/skills` — Technical proficiency matrix with discipline tabs and animated progress tracks.
- `about/CertificatesGallery.tsx` & `/certificates-achievements` — Dual gallery for professional certifications and competition awards with verification links.
- `opensource/page.tsx` & `/opensource` — Public open-source repositories and packages showcase with GitHub stars, forks, and language badges.
- `testimonials/page.tsx` & `/testimonials` — Client and colleague endorsements with avatar, company, role, and verification links.
- `stats/page.tsx` & `/stats` — Platform metrics and telemetry dashboard (projects, blog posts, papers, skills, experience, GitHub stars).
- `newsletter/page.tsx` & `/newsletter` — Dedicated engineering newsletter subscription hub and archive overview.
- `pages/DynamicPageRenderer.tsx` & `/[slug]` — Dynamic generic catch-all route rendering custom pages (`/now`, `/uses`, `/stack`, `/reading`, `/bookmarks`, `/learning`, `/talks`, `/services`, `/faq`, `/changelog`, `/recommendations`) with attached content blocks.
- `contact/ContactForm.tsx` & `/contact` — Secure inquiry form with validation, status feedback, and direct email contacts.
- `resume/ResumeViewer.tsx` & `/resume` — Print-friendly online resume with PDF download trigger.
- `guestbook/` & `/guestbook` — Public visitor guestbook form and moderation-filtered greeting feed.
- `search/SearchInterface.tsx` & `/search` — Multi-domain instant search interface with category filtering.
- `app/not-found.tsx` & `app/error.tsx` — Developer-themed retro 404 screen and error boundary recovery.

---

## 2026-08-25

### Phase 5: Frontend Design System Primitives & Client Infrastructure

#### Added: Core Client Infrastructure (`apps/web/src/`)

- `lib/api.ts` — Unified typed API client with base URL configuration, bearer token synchronization, and error normalization.
- `lib/queryClient.ts` — TanStack Query client factory with 5-minute public stale time and exponential retry backoff.
- `components/providers/` — Complete provider hierarchy (`QueryProvider`, `ThemeProvider` with zero-flicker sync, `ToastProvider` with Sonner, `AppProviders` composer).
- Updated `app/layout.tsx` — Wrapped application tree in `AppProviders`.

#### Added: Accessible Design System Primitives (`apps/web/src/components/ui/`)

- `button.tsx` — Button variants (`primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`), sizes (`sm`, `md`, `lg`, `icon`), loading spinner state, and focus rings.
- `card.tsx` — Surface card container with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.
- `badge.tsx` — Compact pill badges with semantic variants (`default`, `accent`, `outline`, `muted`, `success`, `warning`, `destructive`).
- `input.tsx` & `textarea.tsx` — Accessible form inputs with label, helper text, error states, and focus rings.
- `dialog.tsx` — Accessible modal dialog with focus trapping, backdrop blur, Escape dismissal, and portal mounting.
- `popover.tsx` & `dropdown.tsx` — Floating popovers and dropdown menus with click-outside listener.
- `tabs.tsx` & `accordion.tsx` — Keyboard-navigable tab panels and expandable accordions with smooth state transitions.
- `skeleton.tsx` & `spinner.tsx` — Pulse placeholder loaders and rotating SVG spinners.
- `separator.tsx` — Full-width horizontal and vertical section dividers.
- `avatar.tsx` — User and author avatars with fallback initials and image error handling.
- `tooltip.tsx` — Accessible hover/focus helper tooltips.
- `theme-toggle.tsx` — Theme switcher button cycling dark/light modes with animated icons.

#### Added: Motion & Scroll Reveal (`apps/web/src/components/motion/`, `hooks/`)

- `hooks/useScrollReveal.ts` — IntersectionObserver hook tracking viewport visibility.
- `components/motion/RevealOnScroll.tsx` — Wrapper component implementing the unified global motion rule (`translateY(16px)` $\to$ `0`, `opacity: 0` $\to$ `1`, `600ms cubic-bezier(0.16, 1, 0.3, 1)`) with stagger delays and `prefers-reduced-motion` safety.
- Updated `globals.css` with `.reveal-on-scroll`, `.is-revealed`, and `.reveal-delay-*` classes.

#### Added: Rich Long-Form Markdown / MDX Engine (`apps/web/src/components/content/`)

- `CodeBlock.tsx` — Syntax-highlighted code block with language pill badge, line numbers, and copy code button with toast feedback.
- `Callout.tsx` — GitHub-style alert callout boxes (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`) with left border accents and icons.
- `TableOfContents.tsx` — Auto-generated heading hierarchy with active scroll-spy heading highlighting and smooth jump navigation.
- `ZoomableImage.tsx` — Responsive markdown image with caption and click-to-zoom lightbox modal.
- `MarkdownRenderer.tsx` — Unified markdown renderer composing code blocks, callouts, images, blockquotes, tables, and anchor links.

#### Added: Domain Data Fetching Hooks (`apps/web/src/hooks/`)

- `useProjects.ts`, `useBlogPosts.ts`, `useResearch.ts`, `useProfile.ts`, `useLayout.ts`, `useInteractions.ts`, `useDiscovery.ts`, `useAnalyticsTracker.ts` — Comprehensive TanStack Query hooks covering all 20+ backend REST API domain modules and automated visitor telemetry.

---

## 2026-08-25

### Phase 4: Backend REST API Domain Modules

#### Added: Shared Contracts & Utilities (`packages/shared/src/`, `apps/api/src/utils/`)

- Shared DTOs: `SearchType`, `SearchResultItemDto`, `SearchResultsDto`, `PublicStatsDto`, `TagDto`, `TagWithCountDto`, `ContentVersionDto`, `GalleryItemDto`, `NewsletterSubscriberDto`.
- Shared Zod Schemas: `searchQuerySchema`, `createTagSchema`, `updateTagSchema`, `listTagsQuerySchema`, `restoreVersionParamsSchema`, `reorderSchema`, `slugParamSchema`, `upsertProjectCategorySchema`, `upsertBlogCategorySchema`, `createResumeSchema`, `upsertOpensourceSchema`, `upsertGalleryItemSchema`, `upsertTestimonialSchema`.
- Backend Utilities: `calculateReadingTime` (WPM estimation for markdown), `saveContentVersion` (automatic snapshotting to `content_versions`), `buildPagination`/`getPrismaPagination`, `map*ToDto` comprehensive domain mappers across all 20+ models.

#### Added: Content Domain Modules (`apps/api/src/`)

- **Projects & Categories** (`/api/v1/projects`, `/api/v1/project-categories`): Full CRUD, slug routing, pagination, category filtering, featured filters, image galleries, tags association, and content versioning.
- **Blog Posts & Categories** (`/api/v1/blogs`, `/api/v1/blog-categories`): Full CRUD, reading time auto-calculation, tags association, and content version history rollback (`GET /blogs/:id/versions`, `POST /blogs/:id/versions/:version/restore`).
- **Research Papers** (`/api/v1/research`): CRUD, status management, pagination, and direct PDF download/redirect (`GET /research/:slug/download`).
- **Dynamic Pages & Content Blocks** (`/api/v1/pages`, `/api/v1/content-blocks`): Custom markdown pages (`/now`, `/uses`, `/stack`) with associated reusable content blocks and reordering.

#### Added: Profile & Portfolio Modules (`apps/api/src/`)

- **About Sections** (`/api/v1/about-sections`): Reorderable markdown sections.
- **Skills & Categories** (`/api/v1/skills`, `/api/v1/skill-categories`): Categorized skills with proficiency scores, icons, and category reordering.
- **Experiences & Education** (`/api/v1/experiences`, `/api/v1/education`): Chronological career history and academic credentials with institution logo relations.
- **Certificates & Achievements** (`/api/v1/certificates`, `/api/v1/achievements`): Badges, credentials with validation URLs, awards, and recognitions.
- **Timeline Events** (`/api/v1/timeline-events`): Chronological milestone events with career/education/life classifications.
- **Resumes** (`/api/v1/resumes`): Versioned PDF resume store, active resume download redirect (`GET /resumes/active/download`), and single-active transaction toggle.
- **Social Links & Open Source** (`/api/v1/social-links`, `/api/v1/opensource`): Social profiles and public GitHub repositories with star/fork metrics.
- **Gallery** (`/api/v1/gallery`): Media gallery with categories, captions, and sort ordering.

#### Added: Layout & Site Configuration Modules (`apps/api/src/`)

- **Homepage Sections** (`/api/v1/homepage-sections`): Modular homepage layouts with dynamic JSON configuration and block relations.
- **Navigation Menus** (`/api/v1/nav-items`): Hierarchical tree builder supporting header, footer, or both locations with nested children.
- **Site Settings** (`/api/v1/site-settings`): Dynamic key-value configuration with public map projection and bulk admin upsert.

#### Added: Interactions, Moderation & Communications (`apps/api/src/`)

- **Contact Submissions Inbox** (`/api/v1/contact`): Admin submissions inbox with pagination, read/replied status tracking, and deletion.
- **Guestbook** (`/api/v1/guestbook`): Public message submissions with moderation workflows (`approved`, `rejected`, `pending`).
- **Testimonials** (`/api/v1/testimonials`): Client and peer testimonials with avatar relations and featured flags.
- **Newsletter** (`/api/v1/newsletter`): Double opt-in subscriptions, confirmation tokens, unsubscriptions, and admin export.

#### Added: Discovery, Taxonomy & Background Jobs (`apps/api/src/`)

- **Tags Taxonomy** (`/api/v1/tags`): Global tag taxonomy with entity usage counts and slug-based lookup.
- **Global Search Engine** (`/api/v1/search`): Unified multi-entity search spanning projects, blogs, research papers, pages, skills, and about sections.
- **Public Aggregated Stats** (`/api/v1/stats`): Aggregated public metrics (projects, blogs, papers, skills, experience duration, stars).
- **Scheduled Content Publisher** (`services/scheduler.service.ts`): Background job auto-publishing scheduled articles, projects, papers, and pages.

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

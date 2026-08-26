# Project Context

> Living document providing full context to AI agents and new contributors.
> **Update this file every time something significant is added, changed, or decided.**

---

## Project Overview

A **dynamic portfolio platform** for a developer/professional, where all content is managed from an admin panel and served via API. Not a static portfolio — every piece of content is database-driven.

- **Brand name:** Anuj Yadav
- **Target audience:** Developers and technical teams
- **Visual style:** Minimal, premium, dark-first with light theme support

---

## Technology Stack

| Layer         | Technology                                                 |
| ------------- | ---------------------------------------------------------- |
| Frontend      | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui  |
| Backend       | Node.js, Express.js, TypeScript                            |
| Database      | PostgreSQL                                                 |
| ORM           | Prisma                                                     |
| Validation    | Zod (shared between frontend and backend)                  |
| Data fetching | TanStack Query                                             |
| Forms         | React Hook Form                                            |
| Auth          | JWT + Refresh Tokens                                       |
| Rich content  | Markdown / MDX                                             |
| Testing       | Vitest, Supertest, React Testing Library, Playwright (E2E) |
| File storage  | Cloudinary or instance storage                             |
| Email         | SMTP                                                       |
| Deployment    | Any instance (frontend + backend independently)            |

---

## Architecture Summary

```
Next.js Frontend  ←→  Express API  ←→  PostgreSQL
                          ↕
                   Object Storage (images, PDFs)
```

- **Monorepo structure:** `apps/web/` (frontend), `apps/api/` (backend), `packages/shared/` (types, schemas, constants)
- **Backend layering:** Route → Controller → Service → Repository → Prisma
- **Frontend pattern:** Server/Client components → Custom hooks (TanStack Query) → API client
- **Theme:** CSS custom properties on `:root` (dark default) / `.light` class, consumed via Tailwind

---

## Database

- **38 tables**, **12 enums** — full schema in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- Key patterns: `content_status` enum for lifecycle, `is_enabled` + `sort_order` for visibility, centralized `media` table, polymorphic `entity_tags` for tagging, `content_versions` for history, `pages` table for dynamic routes

---

## Design System

- **Font:** Geist Variable
- **Accent color:** `#ff8c42` (warm orange) — same in both themes
- **Dark background:** `#000000`
- **Light background:** `#faf8f5`
- **Spacing scale:** 8, 12, 16, 24, 32, 48, 64, 96 px
- **Radius base:** 4px
- **Motion default:** 300ms, ease-out
- **Accessibility:** WCAG 2.2 AA baseline

Full tokens in [DESIGN_TOKENS.md](DESIGN_TOKENS.md), CSS implementation in [CSS_TOKENS.md](CSS_TOKENS.md).

---

## Documentation Files

All documentation lives in the `docs/` folder. See [README.md](README.md) for the full index.

| File                                                    | Purpose                                                                     |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| [DETAILED_ROADMAP.md](DETAILED_ROADMAP.md)              | Master end-to-end roadmap covering all 10 phases                            |
| [README.md](../README.md)                               | Project root guide and getting started instructions                         |
| [README.md](README.md)                                  | Documentation index and navigation                                          |
| [CONTEXT.md](CONTEXT.md)                                | This file — living project context                                          |
| [CHANGELOG.md](CHANGELOG.md)                            | Record of all significant changes                                           |
| [PROJECT_GUIDELINES.md](PROJECT_GUIDELINES.md)          | Development principles and rules                                            |
| [AGENT_RULES.md](AGENT_RULES.md)                        | AI agent-specific rules                                                     |
| [CODING_STANDARDS.md](CODING_STANDARDS.md)              | Naming and coding conventions                                               |
| [ARCHITECTURE_RULES.md](ARCHITECTURE_RULES.md)          | Structural boundaries and patterns                                          |
| [UI-DESIGN-GUIDELINES.md](docs/UI-DESIGN-GUIDELINES.md) | Visual source of truth from UI reference images and unified animation rules |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)                    | Visual design guidelines                                                    |
| [DESIGN_TOKENS.md](DESIGN_TOKENS.md)                    | Semantic token definitions                                                  |
| [TAILWIND_GUIDELINES.md](TAILWIND_GUIDELINES.md)        | Tailwind CSS usage rules                                                    |
| [CSS_TOKENS.md](CSS_TOKENS.md)                          | CSS custom properties and global styles                                     |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)                | PostgreSQL schema (38 tables, 12 enums)                                     |
| [FEATURES_LIST.md](FEATURES_LIST.md)                    | 44 documented features                                                      |
| [URL_IDEAS.md](URL_IDEAS.md)                            | Public and admin route architecture                                         |
| [TECH_STACK.md](TECH_STACK.md)                          | Technology choices                                                          |
| [DARK_DESIGN.md](DARK_DESIGN.md)                        | Dark theme design tokens (source)                                           |
| [LIGHT_DESIGN.md](LIGHT_DESIGN.md)                      | Light theme design tokens (source)                                          |

---

## Key Decisions Made

| Decision                                                      | Rationale                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Dynamic pages via `pages` table, not individual Next.js files | Routes like `/now`, `/uses`, `/faq` are admin-created content, not code  |
| Polymorphic `entity_tags` (no DB-level FK on `entity_id`)     | Avoids N junction tables; integrity enforced in app layer                |
| Content versioning via JSONB snapshots                        | Generic approach avoids per-table version tables                         |
| SEO metadata inlined on content tables                        | Every page has exactly one SEO record; JOINs add latency with no benefit |
| Homepage sections driven by `homepage_sections` table         | Admin controls order and visibility without code changes                 |
| `site_settings` as key-value store                            | Flexible for global config without schema changes                        |
| CSS custom properties as single source of truth for tokens    | Tailwind maps `var(--*)` — theme switching is CSS-only, no JS rebuild    |
| Dark theme as default                                         | Matches the primary brand aesthetic                                      |

---

## Current Status

- **Phase:** Phase 9 complete — Quality Assurance, Accessibility, Performance & Security.
- **Database:** PostgreSQL schema fully migrated (38 models, 11 enums, indexes, constraints) and seeded with admin user, complete SEO site settings (`site_url`, `robots_indexing_enabled`, `twitter_handle`, `author_name`), homepage sections, navigation, sample content, and taxonomy.
- **Backend:** Express API with all 20+ domain modules, comprehensive Vitest + Supertest unit and integration test suite, Helmet security hardening (CSP, HSTS, X-Frame-Options), strict multi-origin CORS whitelisting, rate limiting, and parameterized database queries.
- **Frontend:** Next.js 16 (Turbopack) with 76 optimized production routes compiled with zero type errors:
  - **Testing & QA:** Vitest + React Testing Library unit & accessibility test suite covering UI primitives, layout shells, command palette, and markdown rendering.
  - **E2E Automation:** Playwright test suite for critical public and admin user journeys across Chromium, Firefox, WebKit, and Mobile Chrome.
  - **WCAG 2.2 AA Accessibility:** Screen reader landmarks (`role="main"`, `role="banner"`, `role="contentinfo"`), ARIA combobox and modal dialog patterns, focus trap management, SkipLink, and contrast ratio compliance.
  - **Performance Optimization:** Next.js image optimization (AVIF/WebP, remote patterns), compression, font preloading, and caching headers.
  - **Security Hardening:** XSS prevention via `rehype-sanitize` in markdown pipeline, parameter validation, and secure authentication rotation.
- **Shared:** Complete domain-organized types, DTOs, request payloads, enums, Zod validation schemas, and constants compiled and verified across all workspaces.
- **Next step:** Phase 10 — Production Deployment & CI/CD (Database provisioning, containerized Express deployment, Next.js Vercel/Node deployment, and GitHub Actions automation).

---

## How to Update This File

When you complete a significant piece of work, add or update the relevant section:

- New technology added → update **Technology Stack**
- New tables added → update **Database** summary
- Architecture decision made → add to **Key Decisions Made**
- New doc file created → add to **Documentation Files**
- Phase completed → update **Current Status**

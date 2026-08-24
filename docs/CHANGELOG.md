# Changelog

> Record of all significant changes to the project.
> Most recent changes first.

---

## 2025-08-25

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

# Project Guidelines

> Dynamic portfolio platform — Next.js · Express · TypeScript · PostgreSQL · Prisma

---

## 1. Development Principles

1. **Content is data, not code.** Every piece of portfolio content (projects, blogs, skills, experience, pages, navigation, homepage sections) MUST be driven by the database and admin panel. Hardcoding content into components or templates is prohibited unless it is purely structural (layout shells, error boundaries).

2. **Modularity over monolith.** Every feature MUST be self-contained: its own types, components, API routes, services, and validation. Adding a new feature should not require modifying unrelated modules.

3. **Premium quality by default.** Every visible element MUST meet the design system standards defined in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). No placeholder styling, no unstyled components, no inconsistent spacing.

4. **Type safety end-to-end.** TypeScript strict mode is mandatory. Shared types between frontend and backend MUST live in a shared package. No `any` without a written justification.

5. **Accessibility is not optional.** WCAG 2.2 AA compliance is the baseline. Keyboard navigation, focus management, screen reader support, and contrast requirements MUST be met on every interactive element.

---

## 2. Dynamic Content Requirements

- All portfolio content (projects, blogs, research, skills, experience, education, certificates, achievements, timeline, social links, resume, testimonials, guestbook, open source, pages) MUST be stored in the database and served via the API.
- All sections, pages, and navigation items MUST support `is_enabled`, `sort_order`, and content status (`draft`, `published`, `scheduled`, `archived`, `disabled`) where applicable per [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).
- The frontend MUST NOT assume any specific number of items, pages, or sections. Render what the API returns.
- Homepage section order and visibility MUST be controlled from the `homepage_sections` table, not from frontend code.
- New public pages (e.g., `/now`, `/uses`, `/faq`) MUST be created via the `pages` table — not by adding new Next.js page files for each route.

---

## 3. No Unnecessary Hardcoding

The following MUST NOT be hardcoded in frontend or backend code:

| What | Where it belongs |
|---|---|
| Site title, description, availability status | `site_settings` table |
| Navigation links | `nav_items` table |
| Social links | `social_links` table |
| Homepage section order and visibility | `homepage_sections` table |
| SEO defaults | `site_settings` table |
| Email templates | `email_templates` table |
| Color values in components | CSS custom properties / design tokens |
| API URLs | Environment variables |
| Feature text, labels, descriptions | Database or i18n layer |

**Acceptable hardcoding:** structural layout (grid definitions, component shells), error boundary messages, HTTP status codes, validation rules, route path patterns.

---

## 4. Separation of Concerns

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js)                             │
│  ├── Pages / Layouts / Components               │
│  ├── API client layer (fetch wrappers)          │
│  ├── State management (TanStack Query)          │
│  └── Design system (tokens + components)        │
├─────────────────────────────────────────────────┤
│  Shared                                         │
│  ├── Types / Interfaces / DTOs                  │
│  ├── Validation schemas (Zod)                   │
│  └── Constants / Enums                          │
├─────────────────────────────────────────────────┤
│  Backend (Express)                              │
│  ├── Routes / Controllers                       │
│  ├── Services (business logic)                  │
│  ├── Repositories (database queries)            │
│  ├── Middleware (auth, validation, rate limit)   │
│  └── Utilities                                  │
├─────────────────────────────────────────────────┤
│  Database (PostgreSQL + Prisma)                 │
│  └── Schema, migrations, seeds                  │
└─────────────────────────────────────────────────┘
```

- Frontend MUST NOT access the database directly.
- Backend MUST NOT return raw Prisma models — map to DTOs.
- Shared types MUST NOT import from frontend or backend packages.
- Components MUST NOT contain business logic or API calls. Use hooks or server components.

---

## 5. Adding New Features

When adding a new feature:

1. **Check existing patterns.** Review at least one similar existing feature (e.g., look at blogs before adding research papers).
2. **Define the data model.** Add or update tables in the Prisma schema. Run a migration.
3. **Create shared types.** Add DTOs and validation schemas to the shared package.
4. **Build the backend.** Route → Controller → Service → Repository, following existing patterns.
5. **Build the frontend.** Page → Components → API hooks, following existing patterns.
6. **Add admin support.** Every manageable entity MUST have corresponding admin CRUD pages.
7. **Update documentation.** If the feature changes architecture or introduces new patterns, update the relevant guideline files.

---

## 6. Modifying Existing Features

- Read and understand the existing implementation before changing it.
- Do not refactor unrelated code as part of a feature change.
- Preserve backward compatibility unless explicitly breaking it is approved.
- If a change affects the API contract, update shared types and coordinate frontend changes.
- If a change affects the database schema, create a migration — never modify the database manually.

---

## 7. Code Quality Expectations

- All code MUST pass linting (`eslint`) and formatting (`prettier`) checks.
- All code MUST pass TypeScript strict-mode compilation with zero errors.
- Functions MUST be under 30 lines. Extract helpers if exceeded.
- Components MUST have a single responsibility.
- No commented-out code in committed files.
- No `console.log` in production paths — use a structured logger.
- No magic numbers or strings — use named constants.
- Error messages MUST describe what failed and what the caller can do.

---

## 8. Documentation Requirements

- Every non-trivial module SHOULD have a brief comment explaining its purpose.
- Public API endpoints MUST be documented (route, method, request/response shapes).
- Complex business logic MUST have inline comments explaining *why*, not *what*.
- Architecture changes MUST be reflected in the relevant guideline files.

---

## Related Documents

- [AGENT_RULES.md](AGENT_RULES.md) — AI agent-specific rules
- [CODING_STANDARDS.md](CODING_STANDARDS.md) — Naming and coding conventions
- [ARCHITECTURE_RULES.md](ARCHITECTURE_RULES.md) — Structural and module boundaries
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Visual design guidelines
- [DESIGN_TOKENS.md](DESIGN_TOKENS.md) — Semantic token definitions
- [TAILWIND_GUIDELINES.md](TAILWIND_GUIDELINES.md) — Tailwind CSS usage rules
- [CSS_TOKENS.md](CSS_TOKENS.md) — CSS custom properties and global styles
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — PostgreSQL schema reference
- [FEATURES_LIST.md](FEATURES_LIST.md) — Feature requirements
- [URL_IDEAS.md](URL_IDEAS.md) — Route architecture

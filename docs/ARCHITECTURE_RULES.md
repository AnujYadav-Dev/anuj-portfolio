# Architecture Rules

> Structural boundaries and patterns for the dynamic portfolio platform.

---

## 1. Project Structure

```
portfolio/
├── apps/
│   ├── web/                  # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/          # App Router pages and layouts
│   │   │   ├── components/   # Shared UI components
│   │   │   │   ├── ui/       # Design system primitives (Button, Card, Input, ...)
│   │   │   │   ├── layout/   # Page shells (Header, Footer, Sidebar)
│   │   │   │   └── [feature]/ # Feature-specific components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── lib/          # Utilities, API client, formatters
│   │   │   └── styles/       # Global CSS, tokens (if separated from app/)
│   │   └── public/           # Static assets
│   │
│   └── api/                  # Express backend
│       ├── src/
│       │   ├── routes/       # Route definitions
│       │   ├── controllers/  # HTTP layer
│       │   ├── services/     # Business logic
│       │   ├── repositories/ # Database access
│       │   ├── middleware/   # Auth, validation, error handling
│       │   ├── utils/        # Shared utilities
│       │   └── config/       # Environment, constants
│       └── prisma/           # Schema, migrations, seeds
│
├── packages/
│   └── shared/               # Shared between frontend and backend
│       └── src/
│           ├── types/        # DTOs, interfaces, enums
│           ├── schemas/      # Zod validation schemas
│           └── constants/    # Shared constants
│
└── docs/                     # All project documentation
```

---

## 2. Frontend / Backend Separation

### Frontend (Next.js) responsibilities:

- Rendering pages and components
- Client-side routing and navigation
- Design system and styling
- Client-side form validation (using shared Zod schemas)
- State management (TanStack Query)
- SEO rendering (meta tags, JSON-LD from API data)

### Backend (Express) responsibilities:

- API endpoints and HTTP handling
- Authentication and authorization
- Server-side validation (using shared Zod schemas)
- Business logic and data orchestration
- Database access via Prisma
- Email sending
- File upload handling
- Analytics event recording
- Scheduled tasks (content publishing, GitHub sync)

### Boundary rules:

- The frontend MUST NOT import from `apps/api/`.
- The backend MUST NOT import from `apps/web/`.
- Both MUST import shared code only from `packages/shared/`.
- The frontend communicates with the backend exclusively via HTTP API calls.

---

## 3. Backend Layering

```
Request → Route → Middleware → Controller → Service → Repository → Prisma → DB
```

| Layer            | Responsibility                                          | Rules                                             |
| ---------------- | ------------------------------------------------------- | ------------------------------------------------- |
| **Routes**       | Map HTTP methods/paths to controllers                   | No logic. No DB access.                           |
| **Middleware**   | Cross-cutting: auth, validation, rate limiting, logging | Reusable. No business logic.                      |
| **Controllers**  | Parse request, call service, format response            | No DB access. No business logic.                  |
| **Services**     | Business logic, orchestration, DTO mapping              | No HTTP concerns. May call multiple repositories. |
| **Repositories** | Database queries via Prisma                             | No business logic. Return raw Prisma types.       |

### Rules:

- Controllers MUST NOT call repositories directly.
- Services MUST NOT access `req` or `res` objects.
- Repositories MUST NOT throw HTTP errors — throw domain errors.
- Each feature SHOULD have its own route, controller, service, and repository files.

---

## 4. Shared Package

The `packages/shared/` package contains code used by both frontend and backend.

### What belongs in shared:

- DTOs and response types (e.g., `ProjectResponse`, `BlogPostListItem`)
- Request types (e.g., `CreateProjectRequest`)
- Zod validation schemas
- Enum definitions that mirror database enums
- Pagination types
- Error code constants

### What does NOT belong in shared:

- React components or hooks
- Express middleware or request/response types
- Prisma client or model types
- Environment configuration
- Any code that depends on runtime-specific APIs

---

## 5. Component Architecture

### Component categories:

| Category               | Location                | Purpose                                                           |
| ---------------------- | ----------------------- | ----------------------------------------------------------------- |
| **UI primitives**      | `components/ui/`        | Design system components: Button, Card, Input, Badge, Modal, etc. |
| **Feature components** | `components/[feature]/` | Feature-specific: `ProjectCard`, `BlogList`, `TimelineEvent`      |
| **Layout components**  | `components/layout/`    | Page shells: `Header`, `Footer`, `Sidebar`, `PageContainer`       |
| **Admin components**   | `components/admin/`     | Admin panel UI: forms, tables, editors                            |

### Rules:

- UI primitives MUST NOT contain business logic or API calls.
- UI primitives MUST accept data via props — never fetch their own data.
- Feature components SHOULD compose UI primitives.
- Components MUST NOT import from `services/` or `repositories/`.
- Each component SHOULD be in its own file. Co-locate closely related sub-components.

---

## 6. API Layer Rules

### Versioning:

- All API routes MUST be prefixed with `/api/v1/`.
- Breaking changes require a new version (`/api/v2/`), not modifications to existing endpoints.

### Route organization:

```
/api/v1/projects         GET, POST
/api/v1/projects/:id     GET, PUT, DELETE
/api/v1/blog-posts       GET, POST
/api/v1/blog-posts/:id   GET, PUT, DELETE
/api/v1/media            GET, POST
/api/v1/media/:id        GET, DELETE
/api/v1/admin/settings   GET, PUT
/api/v1/analytics/views  POST
```

### Public vs Admin:

- Public endpoints serve published content only (`status = 'published'`).
- Admin endpoints require authentication and can access all statuses.
- Admin routes SHOULD be prefixed with `/api/v1/admin/` where the resource semantics differ from public (e.g., listing drafts).
- When the same resource has both public and admin views, use separate controllers or explicit query scoping.

---

## 7. Database Access Rules

- All database access MUST go through the repository layer.
- MUST use Prisma migrations for schema changes.
- MUST NOT use raw SQL unless Prisma cannot express the query (e.g., complex full-text search). Document why.
- MUST use transactions for multi-table mutations.
- MUST scope public queries to `status = 'published'` and `is_enabled = true`.
- MUST NOT return entire tables — always paginate list queries.
- SHOULD use `select` to fetch only needed fields for list endpoints.

---

## 8. Dynamic Content Patterns

### Feature flags and visibility:

Every entity that appears on the public site MUST respect:

1. **`is_enabled`** — Admin can toggle visibility without deleting data.
2. **`status`** (for content entities) — Only `published` content is public.
3. **`sort_order`** — Admin controls display order.

The frontend MUST NOT filter by these fields — the API MUST return only visible/published content for public endpoints.

### Dynamic pages:

Pages created via the `pages` table (e.g., `/now`, `/uses`, `/faq`) MUST be rendered by a single catch-all route in Next.js that:

1. Fetches page data by slug from the API.
2. Renders the Markdown content.
3. Returns 404 if the page does not exist or is not published.

Do NOT create individual Next.js page files for each dynamic page.

### Homepage sections:

The homepage MUST fetch its section configuration from the `homepage_sections` API and render sections in the returned order. The frontend MUST have a registry mapping `section_key` → React component, but the _order_, _visibility_, and _configuration_ come from the database.

```typescript
// Section registry — maps section_key to component
const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: HeroSection,
  about: AboutSection,
  skills: SkillsSection,
  featured_projects: FeaturedProjectsSection,
  experience: ExperienceSection,
  latest_articles: LatestArticlesSection,
  contact: ContactSection,
};
```

### Navigation:

Navigation items MUST be fetched from the `nav_items` API. The frontend MUST NOT hardcode navigation links.

---

## 9. Avoiding Circular Dependencies

- Shared package MUST NOT depend on frontend or backend.
- Frontend MUST NOT depend on backend.
- Within the backend, dependencies flow downward: routes → controllers → services → repositories.
- Services MAY call other services if needed, but avoid deep chains.
- If two services depend on each other, extract the shared logic into a third service.

---

## 10. Reusable Utility Patterns

### Frontend utilities (`apps/web/lib/`):

- `api.ts` — API client with base URL, auth headers, error handling.
- `format.ts` — Date, number, reading time formatters.
- `seo.ts` — Meta tag and JSON-LD generators.
- `cn.ts` — Class name merger (clsx + tailwind-merge).

### Backend utilities (`apps/api/src/utils/`):

- `pagination.ts` — Pagination parameter parsing and response building.
- `slug.ts` — Slug generation and validation.
- `mapper.ts` — Prisma model → DTO mapping helpers.
- `errors.ts` — Custom error classes.

### Shared utilities (`packages/shared/`):

- Type definitions and Zod schemas only.
- No runtime logic that depends on Node.js or browser APIs.

---

## Related Documents

- [PROJECT_GUIDELINES.md](PROJECT_GUIDELINES.md) — Development principles
- [CODING_STANDARDS.md](CODING_STANDARDS.md) — Naming and coding conventions
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — PostgreSQL schema

# Coding Standards

> Conventions for TypeScript · Next.js · Express · Prisma · PostgreSQL

---

## 1. Naming Conventions

### Files and Folders

| Item | Convention | Example |
|---|---|---|
| React components | `PascalCase.tsx` | `ProjectCard.tsx` |
| React pages (Next.js App Router) | `page.tsx`, `layout.tsx` | `app/blogs/page.tsx` |
| Hooks | `camelCase.ts`, prefixed `use` | `useProjects.ts` |
| Utilities | `camelCase.ts` | `formatDate.ts` |
| Types / Interfaces | `camelCase.ts` | `project.ts` |
| Constants | `camelCase.ts` | `routes.ts` |
| Backend routes | `camelCase.route.ts` | `project.route.ts` |
| Backend controllers | `camelCase.controller.ts` | `project.controller.ts` |
| Backend services | `camelCase.service.ts` | `project.service.ts` |
| Backend repositories | `camelCase.repository.ts` | `project.repository.ts` |
| Middleware | `camelCase.middleware.ts` | `auth.middleware.ts` |
| Validation schemas | `camelCase.schema.ts` | `project.schema.ts` |
| Test files | `*.test.ts` or `*.test.tsx` | `project.service.test.ts` |
| Folders | `kebab-case` | `admin-dashboard/` |

### Variables and Functions

| Item | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `projectList` |
| Constants (module-level) | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE` |
| Functions | `camelCase`, verb prefix | `getProjectBySlug` |
| Boolean variables | `is`/`has`/`can`/`should` prefix | `isEnabled`, `hasContent` |
| Event handlers | `handle` prefix | `handleSubmit` |
| Callback props | `on` prefix | `onSelect` |

### Types and Interfaces

| Item | Convention | Example |
|---|---|---|
| Interfaces | `PascalCase` | `ProjectResponse` |
| Types | `PascalCase` | `ContentStatus` |
| Enums | `PascalCase` | `ProjectType` |
| Enum values | `PascalCase` | `ProjectType.OpenSource` |
| Generic parameters | Single uppercase or descriptive | `T`, `TData` |
| DTO types | `PascalCase` + `Dto` suffix | `CreateProjectDto` |
| API response types | `PascalCase` + `Response` suffix | `ProjectListResponse` |
| API request types | `PascalCase` + `Request` suffix | `CreateProjectRequest` |

### Database and API

| Item | Convention | Example |
|---|---|---|
| DB tables | `snake_case`, plural | `blog_posts` |
| DB columns | `snake_case` | `created_at` |
| Prisma models | `PascalCase`, singular | `BlogPost` |
| API routes | `kebab-case`, plural nouns | `/api/v1/blog-posts` |
| Query parameters | `camelCase` | `?pageSize=10&sortBy=createdAt` |

---

## 2. TypeScript

### Strict Mode

TypeScript MUST be configured with `strict: true`. This includes:

- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `noUnusedLocals`
- `noUnusedParameters`

### Type Practices

```typescript
// MUST: Explicit return types on exported functions
export function getProjectBySlug(slug: string): Promise<ProjectResponse | null> { ... }

// MUST: Use `unknown` instead of `any` for truly unknown data
function parseApiResponse(data: unknown): ProjectResponse { ... }

// MUST: Use discriminated unions over type assertions
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

// MUST NOT: Suppress type errors
const value = something as any; // ❌
// @ts-ignore                    // ❌

// SHOULD: Prefer interfaces for object shapes, types for unions/intersections
interface ProjectResponse {
  id: string;
  title: string;
  status: ContentStatus;
}

type ContentEntity = BlogPost | Project | ResearchPaper;
```

### Null Handling

- Use `null` for intentionally absent values (from DB or API).
- Use `undefined` for optional function parameters.
- Never use both interchangeably within the same context.

---

## 3. Next.js / React

### Component Structure

```typescript
// 1. Imports (external, then internal, then types, then styles)
import { useState } from 'react';
import { ProjectCard } from '@/components/project-card';
import type { ProjectResponse } from '@shared/types';

// 2. Types (if component-specific)
interface ProjectListProps {
  projects: ProjectResponse[];
  onSelect: (id: string) => void;
}

// 3. Component (named export, not default)
export function ProjectList({ projects, onSelect }: ProjectListProps) {
  // hooks first
  const [filter, setFilter] = useState('');

  // derived values
  const filtered = projects.filter(p => p.title.includes(filter));

  // handlers
  function handleFilterChange(value: string): void {
    setFilter(value);
  }

  // render
  return ( ... );
}
```

### Component Rules

- MUST use named exports, not default exports.
- MUST define props as an explicit interface.
- MUST NOT embed API calls or business logic inside components. Use custom hooks or server components.
- MUST NOT use inline styles. Use Tailwind classes or CSS modules.
- SHOULD keep components under 100 lines. Extract sub-components if exceeded.
- SHOULD co-locate component-specific hooks and types in the same directory.

### Data Fetching

- Server components SHOULD fetch data directly using the API client.
- Client components MUST use TanStack Query hooks for data fetching.
- MUST NOT use `useEffect` + `useState` for data fetching.

---

## 4. Node.js / Express

### Route Structure

```typescript
// Route definition
router.get('/', validate(listProjectsSchema), projectController.list);
router.get('/:slug', projectController.getBySlug);
router.post('/', authenticate, validate(createProjectSchema), projectController.create);
```

### Controller Pattern

```typescript
// Controllers handle HTTP concerns only: parse request, call service, send response
export const projectController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as ListProjectsQuery;
      const result = await projectService.list(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
```

### Service Pattern

```typescript
// Services contain business logic and orchestrate repositories
export const projectService = {
  async list(query: ListProjectsQuery): Promise<PaginatedResponse<ProjectResponse>> {
    const { items, total } = await projectRepository.findMany(query);
    return {
      data: items.map(mapProjectToResponse),
      pagination: buildPagination(query.page, query.pageSize, total),
    };
  },
};
```

### Repository Pattern

```typescript
// Repositories handle database access only
export const projectRepository = {
  async findMany(query: ListProjectsQuery): Promise<{ items: Project[]; total: number }> {
    const [items, total] = await Promise.all([
      prisma.project.findMany({ ... }),
      prisma.project.count({ ... }),
    ]);
    return { items, total };
  },
};
```

---

## 5. Prisma / PostgreSQL

- Prisma schema MUST mirror the conventions in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).
- MUST use Prisma migrations for all schema changes — never modify the database manually.
- MUST NOT expose raw Prisma types to the API layer. Map to DTOs in the service layer.
- MUST use transactions for operations that modify multiple related records.
- SHOULD use `select` or `include` to avoid fetching unnecessary fields.

---

## 6. API Development

### Response Format

```typescript
// Success
{ "data": { ... }, "pagination": { ... } }

// Error
{ "error": { "code": "NOT_FOUND", "message": "Project not found" } }
```

### Conventions

- MUST use RESTful resource naming: `/api/v1/blog-posts`, not `/api/v1/getBlogPosts`.
- MUST version the API: `/api/v1/`.
- MUST return appropriate HTTP status codes (200, 201, 204, 400, 401, 403, 404, 422, 500).
- MUST validate all request bodies and query parameters using Zod.
- MUST NOT return internal error details (stack traces, SQL errors) in production responses.
- MUST support pagination for list endpoints: `page`, `pageSize`, `sortBy`, `sortOrder`.

---

## 7. Validation

- MUST use Zod for all validation.
- MUST define schemas in the shared package so both frontend and backend use the same rules.
- MUST validate on the backend even if the frontend also validates.
- MUST return 422 with field-level errors for validation failures.

```typescript
export const createProjectSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().min(1),
  projectType: z.nativeEnum(ProjectType).default(ProjectType.Personal),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.Draft),
});
```

---

## 8. Error Handling

- MUST use custom error classes extending a base `AppError`.
- MUST NOT use empty catch blocks.
- MUST NOT catch errors just to return `null` — propagate or wrap with context.
- MUST log errors with structured context (request ID, user ID, operation).
- External calls (API, database, file system) MUST have explicit error handling.

```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, identifier: string) {
    super('NOT_FOUND', `${entity} '${identifier}' not found`, 404);
  }
}
```

---

## 9. Logging

- MUST use a structured logger (e.g., `pino` or `winston`), not `console.log`.
- MUST NOT log sensitive data (passwords, tokens, emails in bulk).
- Log levels: `error` (failures), `warn` (degraded), `info` (operations), `debug` (development only).

---

## 10. Environment Variables

- MUST use a `.env` file for local development (never committed).
- MUST validate all env vars at startup using Zod.
- MUST NOT access `process.env` directly outside the config module.
- MUST provide a `.env.example` with all required variables documented.

```typescript
// config.ts — single source of truth
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const config = envSchema.parse(process.env);
```

---

## 11. Authentication and Security

- MUST use JWT access tokens (short-lived) + refresh tokens (stored in `sessions` table, hashed).
- MUST hash passwords with bcrypt or argon2.
- MUST NOT store secrets in code, config files, or client-side bundles.
- MUST use Helmet, CORS, and rate limiting on the Express API.
- MUST validate and sanitize all user input.
- Admin routes MUST require authentication middleware.

---

## 12. Async Code

- MUST use `async/await` — never raw `.then()` chains.
- MUST handle promise rejections explicitly.
- MUST use `Promise.all` for independent concurrent operations.
- MUST NOT use `Promise.all` when operations depend on each other's results.

---

## 13. Imports and Exports

- MUST use named exports. Default exports are only used for Next.js pages (required by framework).
- MUST use path aliases (`@/`, `@shared/`) — never relative paths beyond `./` or `../`.
- Import order (enforced by ESLint):
  1. Node built-ins (`node:`)
  2. External packages (`react`, `express`, `prisma`)
  3. Internal aliases (`@/`, `@shared/`)
  4. Relative imports (`./`, `../`)
  5. Type-only imports (`import type`)
  6. Style imports

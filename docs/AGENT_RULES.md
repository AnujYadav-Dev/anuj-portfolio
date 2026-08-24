# Agent Rules

> Rules for AI coding agents working on this repository.

---

## 1. Before Writing Any Code

1. **Read before you write.** Before modifying any file, read the existing implementation. Understand the current pattern, naming, style, and structure.
2. **Read the relevant guideline files.** Check [PROJECT_GUIDELINES.md](PROJECT_GUIDELINES.md), [CODING_STANDARDS.md](CODING_STANDARDS.md), [ARCHITECTURE_RULES.md](ARCHITECTURE_RULES.md), and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) before implementing anything non-trivial.
3. **Check for existing patterns.** Before creating a new utility, component, type, hook, or service, search the codebase for an existing one that does the same thing.
4. **Check the database schema.** Before creating API routes or frontend pages, verify the data model in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) and the Prisma schema.

---

## 2. Code Changes

### MUST

- Reuse existing utilities, components, types, hooks, and service patterns.
- Follow the file and folder naming conventions in [CODING_STANDARDS.md](CODING_STANDARDS.md).
- Use semantic design tokens from [DESIGN_TOKENS.md](DESIGN_TOKENS.md) — never hardcode color values.
- Use the existing API client layer for frontend data fetching — do not create ad-hoc `fetch` calls.
- Use Zod schemas from the shared package for request/response validation.
- Use the existing error handling patterns (error classes, middleware, response format).
- Keep changes minimal and focused on the requested task.
- Match the indentation, spacing, and style of the surrounding code.
- Remove imports, variables, or functions that your changes made unused.

### MUST NOT

- Introduce hardcoded content that should be dynamic (see [PROJECT_GUIDELINES.md §3](PROJECT_GUIDELINES.md)).
- Modify unrelated files or refactor code that is not part of the current task.
- Duplicate functionality that already exists in the codebase.
- Use `any`, `as any`, or `@ts-ignore` without a written justification comment.
- Add new dependencies without asking first.
- Delete or skip tests to make changes pass.
- Commit commented-out code.
- Create one-off CSS or Tailwind classes that bypass the design system.
- Silently change API contracts, database schemas, or shared types without coordinating both sides.

---

## 3. Architecture Compliance

- Frontend components MUST NOT contain API calls or business logic directly. Use hooks or server components.
- Backend routes MUST follow the Controller → Service → Repository pattern.
- Database access MUST go through the repository layer, never directly from controllers.
- Shared types MUST NOT import from frontend-only or backend-only code.
- New pages that represent dynamic content MUST use the `pages` table — do not create new Next.js route files for content pages.
- All admin-manageable entities MUST support `is_enabled`, `sort_order`, and the content status lifecycle where defined in the schema.

---

## 4. When Something Is Unclear

- **Ambiguous requirement:** State the ambiguity explicitly. List possible interpretations. Ask which is intended. Do not guess silently.
- **Conflicting documentation:** Name the conflict and the two sources. Ask which takes priority.
- **Missing pattern:** If no existing pattern covers the situation, propose an approach that is consistent with the closest existing pattern. Explain your reasoning.
- **Unfamiliar code:** If you do not understand what existing code does, say so. Do not modify code you do not understand.

---

## 5. After Making Changes

- Verify TypeScript compiles with zero errors.
- Verify lint passes with zero errors.
- Verify existing tests still pass.
- If you changed the API contract, verify both frontend and backend are updated.
- If you changed the database schema, create a Prisma migration.
- If you introduced a new pattern or changed architecture, update the relevant guideline file.
- If you changed a visual component, verify it respects both light and dark themes.

---

## 6. Documentation Updates

- If a code change makes existing documentation inaccurate, update the documentation.
- If a new feature introduces a new architectural pattern, document it in [ARCHITECTURE_RULES.md](ARCHITECTURE_RULES.md).
- Do not rewrite documentation that is unrelated to your current change.

---

## 7. Commit Scope

- Each logical change should be a single focused commit.
- Do not bundle unrelated changes.
- Commit messages should describe *what* changed and *why*.

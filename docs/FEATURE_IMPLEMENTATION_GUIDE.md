# Feature Implementation Guide

## Purpose

Use this guide when implementing new features, UI improvements, or changes to either the public-facing website or the admin dashboard.

Before making changes, first understand the existing codebase, architecture, database structure, components, and relevant project documentation.

---

## Before Planning or Coding

1. Read the relevant documentation in the `docs/` directory, especially:

   * `PROJECT_GUIDELINES.md`
   * `ARCHITECTURE_RULES.md`
   * `CODING_STANDARDS.md`
   * `DATABASE_SCHEMA.md`
   * `DESIGN_SYSTEM.md`
   * `UI_DESIGN_GUIDELINES.md`
   * `TECH_STACK.md`
   * `CONTEXT.md`
   * `AGENT_RULES.md`

2. Inspect the relevant existing implementation before proposing changes:

   * Similar public or admin features
   * Existing components and utilities
   * API routes and services
   * Shared types and schemas
   * Database models and relationships

3. Do not assume that a new database table, column, API endpoint, or component is required. First determine whether the requested feature can be implemented using the existing architecture and data.

---

## Database and Data Changes

Before proposing database changes, inspect the current schema and determine:

* Whether the required data already exists.
* Whether existing tables and relationships can support the feature.
* Whether an existing API can provide the required data.
* Whether a new field, table, relation, index, migration, or API endpoint is genuinely necessary.

Prefer extending the existing architecture cleanly over introducing unnecessary database or API complexity.

If a schema change is required, explain clearly:

* Why the current structure is insufficient.
* What must change.
* Which existing features or data may be affected.
* Any required migration or compatibility considerations.

---

## UI and Component Development

Always prefer reusing and extending existing components, patterns, hooks, utilities, design tokens, and layouts.

Do not:

* Duplicate an existing component unnecessarily.
* Hard-code values that should come from configuration, tokens, props, data, or existing utilities.
* Introduce a new design pattern when an established project pattern already solves the problem.
* Refactor unrelated working code without a clear reason.

New UI must remain consistent with the existing design system, responsive behavior, accessibility standards, and coding conventions.

---

## Implementation Approach

Before modifying code:

1. Understand the requested change and its impact.
2. Inspect the relevant code and documentation.
3. Identify reusable components and existing data sources.
4. Check whether database or API changes are actually required.
5. Identify affected frontend, backend, shared, database, test, and documentation areas.
6. Create a clear implementation plan.
7. Wait for approval if the task requires planning before implementation.

Think beyond the explicit request when necessary, like a professional developer, but avoid unnecessary scope expansion.

---

## Quality Requirements

Any implemented change should preserve or improve:

* Type safety
* Reusability
* Accessibility
* Responsive behavior
* Security
* Performance
* Existing functionality
* Test coverage

Add or update tests when behavior changes. Update documentation, schemas, types, or API contracts when they are affected.

After implementation, run the relevant validation commands and report:

* What changed
* What was reused
* Whether database/API changes were required
* Tests and validation results
* Any remaining considerations or follow-up work

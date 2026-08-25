# Anuj Yadav — Portfolio Platform

A dynamic, database-driven portfolio platform built with **Next.js**, **Express**, **TypeScript**, and **PostgreSQL**.

All content is managed from an admin panel and served via API — no hardcoded pages or static content.

---

## Tech Stack

| Layer      | Technology                                           |
| ---------- | ---------------------------------------------------- |
| Frontend   | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend    | Node.js, Express.js, TypeScript                      |
| Database   | PostgreSQL, Prisma ORM                               |
| Validation | Zod (shared between frontend and backend)            |
| Auth       | JWT + Refresh Tokens                                 |

---

## Project Structure

```
portfolio/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   └── api/              # Express backend (port 3001)
├── packages/
│   └── shared/           # Shared types, schemas, constants
├── docs/                 # All project documentation
└── package.json          # Workspace root
```

---

## Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10
- **PostgreSQL** ≥ 15

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

This installs all dependencies across the workspace (`apps/web`, `apps/api`, `packages/shared`).

### 2. Set up environment variables

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your database URL, JWT secrets, etc.
```

### 3. Build the shared package

```bash
npm run build:shared
```

This must be built before starting either app, since both depend on `@portfolio/shared`.

### 4. Start development servers

```bash
# Start the backend (Express on port 3001)
npm run dev:api

# Start the frontend (Next.js on port 3000)
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) for the frontend and [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health) to verify the backend.

---

## Available Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev:api`      | Start the backend dev server             |
| `npm run dev:web`      | Start the frontend dev server            |
| `npm run build:shared` | Build the shared package                 |
| `npm run build:api`    | Build the backend for production         |
| `npm run build:web`    | Build the frontend for production        |
| `npm run build`        | Build everything (shared → api → web)    |
| `npm run lint`         | Run linting across all workspaces        |
| `npm run format`       | Format all files with Prettier           |
| `npm run format:check` | Check formatting without modifying files |

---

## Documentation

All documentation is in the [`docs/`](docs/) folder. See [`docs/README.md`](docs/README.md) for the full index.

| Document                                            | Purpose                                   |
| --------------------------------------------------- | ----------------------------------------- |
| [CONTEXT.md](docs/CONTEXT.md)                       | Living project context and current status |
| [CHANGELOG.md](docs/CHANGELOG.md)                   | Record of all changes                     |
| [PROJECT_GUIDELINES.md](docs/PROJECT_GUIDELINES.md) | Development principles                    |
| [CODING_STANDARDS.md](docs/CODING_STANDARDS.md)     | Naming and coding conventions             |
| [ARCHITECTURE_RULES.md](docs/ARCHITECTURE_RULES.md) | Structural boundaries and patterns        |
| [UI-DESIGN-GUIDELINES.md](docs/UI-DESIGN-GUIDELINES.md)  | Visual source of truth from UI references |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)           | Visual design guidelines                  |
| [DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md)           | Semantic token definitions                |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)       | PostgreSQL schema (38 tables)             |

---

## Design System

- **Font:** Geist Variable
- **Accent:** `#ff8c42` (warm orange)
- **Dark theme** (default): Black background, white text
- **Light theme:** Warm off-white background
- **Accessibility:** WCAG 2.2 AA baseline

Tokens are defined as CSS custom properties in [`apps/web/src/app/globals.css`](apps/web/src/app/globals.css) and consumed via Tailwind v4's `@theme inline`.

---

## License

Private — not open source.

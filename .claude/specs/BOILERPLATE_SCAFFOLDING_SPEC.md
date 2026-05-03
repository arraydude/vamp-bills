# Boilerplate Scaffolding Specification

**Status:** READY FOR IMPLEMENTATION
**Created:** 2026-05-02
**Last Updated:** 2026-05-02
**Purpose:** Stand up the monorepo skeleton (design-system, frontend, backend) on which the vamp-bills MVP will be built.
**Priority:** HIGH (blocks all feature work)
**Complexity:** MEDIUM

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Architecture Design](#3-architecture-design)
4. [Agent Skills](#4-agent-skills)
5. [Implementation Plan](#5-implementation-plan)
6. [Testing Strategy](#6-testing-strategy)
7. [Success Criteria](#7-success-criteria)
8. [Non-Goals](#8-non-goals)

---

## 1. Executive Summary

Bootstrap the vamp-bills repo from "docs only" to a runnable monorepo with three packages — `design-system`, `frontend`, `backend` — wired end-to-end (Vite ↔ Express tRPC ↔ Postgres ↔ BetterAuth) so that subsequent feature work (Bills, Vendors, Payments, lifecycle, intake flows) can drop straight into a working harness.

### Key Metrics

| Metric | Current | Target | Rationale |
|---|---|---|---|
| Runnable packages | 0 | 3 | design-system, frontend, backend |
| `pnpm dev` boots | n/a | All 3 | Single command starts the world |
| Type-safe API surface | 0 procedures | 1 (`health`) | Proves tRPC end-to-end |
| Auth flows wired | 0 | 2 | Email+password and Google OAuth |
| Lint/format tools | 0 | 1 (Biome) | Single tool replaces ESLint + Prettier |
| Postgres provisioning | manual | 1 cmd (`pnpm db:up`) locally; Neon free tier in prod | docker-compose locally, Neon in prod |
| Deployed environments | 0 | 1 | Public Vercel URL serves the same `health` roundtrip |

### Goals

1. **Three-package monorepo** — flat `packages/{design-system,frontend,backend}` layout under pnpm workspaces.
2. **End-to-end roundtrip** — frontend calls a tRPC procedure on the backend, type-safe from server to client.
3. **Auth ready, not used** — BetterAuth installed and mounted with email/password + Google OAuth; routes/UI come later.
4. **One-tool tooling** — Biome 2 for both formatting and linting; ESLint and Prettier removed.
5. **Single-command DX** — `pnpm install && pnpm db:up && pnpm dev` brings up the full stack on a fresh clone.
6. **Public demo URL** — Vercel + Neon deploy serves the same `health` roundtrip on a free, shareable URL.

### Why This Matters

The MVP doc ([`docs/mvp-scope.md`](../../docs/mvp-scope.md)) lists "tech stack, hosting, auth approach, test coverage" as open questions. Locking the stack and producing a working skeleton up front prevents those questions from re-litigating themselves during feature work, and lets the demo-critical flows (intake → approval → payment) be implemented against a stable harness rather than a moving target.

---

## 2. Current State Analysis

### Repo Inventory

```
vamp-bills/
├── docs/
│   ├── mvp-scope.md                    # MVP scope spec (228 lines)
│   └── diagrams/                       # excalidraw + rendered PNG
├── scripts/
│   ├── scrape_ramp.py                  # Playwright scraper for Ramp docs
│   └── build_lifecycle_excalidraw.py   # diagram generator
├── .venv/                              # python venv for scripts/
├── .claude/
│   ├── skills/feature-workflow/        # this workflow skill
│   └── specs/                          # this directory (created in Phase 0)
└── (no package.json, no source code)
```

### Existing Configuration

- **No** `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `biome.json`, `docker-compose.yml`.
- **No** `.git` directory at the repo root (per env metadata: not a git repo). Git init is part of Phase 0.
- **Memory** notes (auto-loaded): vamp-bills is a Ramp Bill Pay-inspired take-home (understand → scope → build); Ramp docs are blocked from automated fetching, use the local Playwright scraper.

### Problems This Spec Resolves

1. **No build harness** — there is nowhere to put TypeScript code; any feature work has to bootstrap first.
   *Resolution:* Phase 0 + Phase 1 create the pnpm workspace, the design system, and the Vite frontend.
2. **Open stack questions in MVP doc** — frontend framework, backend, auth approach, and hosting were all "TBD".
   *Resolution:* All locked in [§3 Decisions](#decisions-locked-during-planning). Hosting is **Vercel + Neon** (see Decisions table). Test coverage remains a Non-Goal for this pass.
3. **No DB / no auth / no API surface** — there's no place a Bill record could live, no procedure it could be created through, and no user it could be created by.
   *Resolution:* Phase 2 lands all three — Drizzle + Postgres (DB), BetterAuth with Google OAuth + email/password (auth), and tRPC `appRouter` (API). Application entities (Bills/Vendors/Payments) are deliberately deferred to the next spec; the *infrastructure* to host them ships in Phase 2.

---

## 3. Architecture Design

### Decisions Locked During Planning

Recorded explicitly per `workflow-collaboration-loop`:

| Decision | Confirmed | Rationale |
|---|---|---|
| Monorepo layout: flat `packages/*` (no `apps/*`) | User | Simpler mental model than apps/packages split for a 3-package repo |
| Package manager: pnpm | User | Workspaces, fast installs, deterministic |
| Language: TypeScript everywhere | User | Type safety end-to-end via tRPC |
| Design system: shadcn preset `b3STOl8d7` (luma/mist/lime/tabler/noto-sans/small/base) | User | Pre-themed, Base UI primitives, Tailwind v4 |
| Frontend bundler: Vite | User | Fast dev, no SSR needed for demo |
| Router: TanStack Router | User | Type-safe routes/search-params; pairs with TanStack Query |
| Server-state: TanStack Query + tRPC | User | End-to-end type safety |
| Forms: TanStack Form (per shadcn `Field`/`FieldLabel` integration) | User | Matches the rest of the TanStack stack |
| Tables: TanStack Table | User | For the Bills list |
| Local UI state: React Context API | User | No global store needed at MVP scale |
| Backend: Express 5 + tRPC | User | Pragmatic; tRPC over `createExpressMiddleware` |
| ORM/DB: Drizzle + Postgres | User | Schema-first, migrations via `drizzle-kit` |
| Auth: BetterAuth (email+password + Google OAuth) | User | Real auth, not a "View as" dropdown |
| API style: tRPC for everything (no REST) for MVP | User | File upload deferred to post-MVP |
| Tooling: Biome 2 (replaces ESLint + Prettier) | User | Single tool, fast |
| Design-system package name: keep `@workspace/ui` | Recommended | Avoids search-replacing every shadcn-generated import |
| **Hosting: Vercel + Neon Postgres** (free tier) | User (preferred over Netlify) | One-platform deploy via git push; Vercel hosts both the Vite SPA *and* the Express backend (serverless function); Neon is a free, drizzle-compatible Postgres with one-click Vercel integration. Demo-grade only — no custom domain, no preview-env protection, no monitoring. |

**Vercel deployment shape (for §3 awareness; actual deploy is a future spec):**
- Vite SPA → Vercel static output (default Vite preset).
- Express backend → wrapped as a single Vercel serverless function via `api/index.ts` that re-exports the Express `app`. `vercel.json` rewrites `/trpc/*` and `/api/auth/*` to that function.
- Postgres → Neon free tier, `DATABASE_URL` set as a Vercel env var.
- BetterAuth `BETTER_AUTH_URL` set to the Vercel deployment URL; Google OAuth redirect added on the Google Cloud Console side.

### Target Folder Structure

```
vamp-bills/
├── packages/
│   ├── design-system/                  # shadcn (renamed from packages/ui)
│   │   ├── src/
│   │   │   ├── components/             # shadcn primitives
│   │   │   ├── lib/utils.ts
│   │   │   └── styles/globals.css      # Tailwind v4 + theme tokens
│   │   ├── components.json
│   │   └── package.json                # name: "@workspace/ui" (kept)
│   ├── frontend/                       # Vite + React (renamed from apps/web)
│   │   ├── src/
│   │   │   ├── routes/                 # TanStack Router file-based routes
│   │   │   │   ├── __root.tsx
│   │   │   │   └── index.tsx           # calls trpc.health.useQuery()
│   │   │   ├── lib/
│   │   │   │   ├── trpc.ts             # tRPC client + react-query proxy
│   │   │   │   └── auth-client.ts      # BetterAuth React client
│   │   │   ├── main.tsx
│   │   │   └── routeTree.gen.ts
│   │   ├── vite.config.ts              # router plugin + dev proxy
│   │   ├── tsconfig.json
│   │   └── package.json                # name: "@vamp-bills/frontend"
│   └── backend/                        # Express + tRPC (added manually)
│       ├── src/
│       │   ├── db/
│       │   │   ├── schema.ts           # placeholder (auth tables only at this stage)
│       │   │   └── client.ts           # drizzle(pg.Pool)
│       │   ├── trpc/
│       │   │   ├── context.ts          # builds ctx.user from BetterAuth session
│       │   │   ├── trpc.ts             # initTRPC, publicProcedure, protectedProcedure
│       │   │   └── router.ts           # appRouter { health }; exports `type AppRouter`
│       │   ├── auth.ts                 # betterAuth({ google, email/pwd, drizzleAdapter })
│       │   └── index.ts                # express, mounts /trpc and /api/auth/*
│       ├── drizzle.config.ts
│       ├── tsconfig.json
│       └── package.json                # name: "@vamp-bills/backend"
├── biome.json
├── docker-compose.yml                  # postgres only
├── pnpm-workspace.yaml                 # packages: ['packages/*']
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── package.json                        # root scripts
└── (existing) docs/, scripts/, .venv/, .claude/
```

### Before / After

| Concern | Before | After |
|---|---|---|
| Layout | Empty repo with docs/scripts only | 3-package pnpm monorepo |
| Frontend startup | n/a | `pnpm --filter @vamp-bills/frontend dev` → `:5173` |
| Backend startup | n/a | `pnpm --filter @vamp-bills/backend dev` → `:3000` |
| API contract | n/a | `appRouter.health` returns `{ ok, ts }`, type-imported by frontend |
| DB | n/a | `docker compose up -d postgres` → `:5432` |
| Auth | n/a | `/api/auth/*` mounted; `/sign-up/email`, `/sign-in/social/google` available |
| Lint/format | n/a | `pnpm check` runs Biome over the whole tree |

### Note on shadcn `--monorepo --template vite` Output

`pnpm dlx shadcn@latest init --monorepo --template vite` creates **two** packages, not a duplicate of one:

- `apps/web` — the Vite + React frontend (becomes our `packages/frontend`)
- `packages/ui` — the design system, package name `@workspace/ui` (becomes our `packages/design-system`)

We post-process the layout to flat `packages/*`. We **keep** `@workspace/ui` as the design-system's package name so all shadcn-generated imports inside the frontend (`@workspace/ui/components/button`, etc.) keep working without a search-replace. In pnpm, package name and directory location are independent.

Other shadcn flag notes: `--base base` selects Base UI (not Radix), so components use the `render` prop, not `asChild`. The `--rtl --pointer` flags add bidirectional and pointer-device variants — harmless to keep.

---

## 4. Agent Skills

The Claude harness can load tool-specific skills that bundle conventions, gotchas, and patterns for a given library. We install them at the project level (in `.claude/skills/`) so the knowledge travels with the repo and applies to anyone running Claude in this directory. Two distribution channels:

- **skills.sh** (general-purpose registry) — installed via `npx skills add <owner/repo@skill>`.
- **TanStack Intent** ([`tanstack.com/intent/latest`](https://tanstack.com/intent/latest)) — TanStack's official channel; skills ship inside `@tanstack/*` npm packages and are auto-discovered from `node_modules` once those packages are installed. Surface them with `npx -y @tanstack/intent install` (or the equivalent CLI per the intent docs).

### Skills to Install

Survey results from `npx skills find` on 2026-05-02 (install counts at time of search):

| Tool | Skill | Source | Installs | Notes |
|---|---|---|---|---|
| BetterAuth (core) | `better-auth/skills@better-auth-best-practices` | **Official** | 44.7K | Maintained by the BetterAuth team |
| BetterAuth (email/pwd) | `better-auth/skills@email-and-password-best-practices` | Official | 13.8K | Covers our auth flow |
| BetterAuth (security) | `better-auth/skills@better-auth-security-best-practices` | Official | 10.7K | Session/CSRF/cookie hardening |
| Drizzle ORM | `bobmatnyc/claude-mpm-skills@drizzle-orm` | Community | 4.2K | Most-installed generic Drizzle skill (no Postgres-specific official option exists) |
| Drizzle migrations | `bobmatnyc/claude-mpm-skills@drizzle-migrations` | Community | 643 | Companion skill — migration workflow |
| Vite | `antfu/skills@vite` | Vite core (antfu) | 20.2K | By a Vite core team member |
| tRPC | `bobmatnyc/claude-mpm-skills@trpc-type-safety` | Community | 1K | No official tRPC skill exists |
| Biome | `biomejs/biome@biome-developer` | **Official** | 129 | Official but low installs (skill is new) |
| TanStack Query | discovered via `@tanstack/intent` after `pnpm add @tanstack/react-query` | TanStack Intent | n/a | Official channel |
| TanStack Router | discovered via `@tanstack/intent` | TanStack Intent | n/a | Official channel |
| TanStack Form | discovered via `@tanstack/intent` | TanStack Intent | n/a | Official channel |
| TanStack Table | discovered via `@tanstack/intent` | TanStack Intent | n/a | Official channel |

### Explicitly skipped

| Tool | Reason |
|---|---|
| Express | No high-quality skill in registry; Express is well-trodden territory and the existing knowledge is sufficient |
| Postgres (vanilla `pg`) | Top results are vendor-specific (Supabase, Neon, Azure); none fit our self-hosted-via-docker setup |
| pnpm | No skill needed — workspace usage is configured once in `pnpm-workspace.yaml` and not iterated on |
| shadcn | Already loaded as a built-in plugin skill (used during planning) |

### Install commands (run during the relevant phase)

```bash
# Phase 0 — tools that apply across all phases (already in use)
npx skills add better-auth/skills@better-auth-best-practices -y
npx skills add better-auth/skills@email-and-password-best-practices -y
npx skills add better-auth/skills@better-auth-security-best-practices -y
npx skills add antfu/skills@vite -y
npx skills add biomejs/biome@biome-developer -y

# Phase 2 — backend stack
npx skills add bobmatnyc/claude-mpm-skills@drizzle-orm -y
npx skills add bobmatnyc/claude-mpm-skills@drizzle-migrations -y
npx skills add bobmatnyc/claude-mpm-skills@trpc-type-safety -y

# Phase 3 — TanStack via intent (auto-discovered after `pnpm add @tanstack/*`)
npx -y @tanstack/intent install   # exact command per https://tanstack.com/intent/latest/docs
```

> **Verify before installing each.** Per `find-skills` guidance: re-check install count and source reputation when running. If a skill has dropped or a better one has appeared, update this list. Update the skill list in the spec (per `spec-living-document`) if substitutions are made.

---

## 5. Implementation Plan

### Progress Tracker

- [ ] **Phase 0: Repo Foundation** — git init, .gitignore, .env.example, docker-compose, the spec file itself
- [ ] **Phase 1: Design System + Frontend Skeleton** — shadcn init, restructure to flat `packages/*`, Biome
- [ ] **Phase 2: Backend Skeleton** — Express + tRPC + Drizzle + BetterAuth, `health` procedure
- [ ] **Phase 3: Frontend Wiring** — TanStack stack, tRPC/auth clients, index route hits `health`
- [ ] **Phase 4: Local End-to-End Verification** — DB up, auth tables, full roundtrip, builds clean
- [ ] **Phase 5: Deploy to Vercel + Neon** — single Vercel project (frontend + Express serverless), Neon Postgres, public URL serves the same `health` roundtrip

Branches: `feature/boilerplate-phase0` through `feature/boilerplate-phase5`. One PR per phase.

---

### Phase 0 — Repo Foundation

**Goal:** establish the repo's outermost shell — version control, environment template, database, and the spec itself — so subsequent phases have a place to land.

**Files Created:**
- `.gitignore` (Node + venv + .env + dist + .turbo)
- `.env.example` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- `docker-compose.yml` (single `postgres:16` service, volume `pgdata`, port `5432`)
- `.claude/specs/BOILERPLATE_SCAFFOLDING_SPEC.md` (this spec — already created during planning, committed in Phase 0)

**Tasks:**
- [ ] `git init` at repo root; first commit captures the existing `docs/`, `scripts/`, `.venv/`, and this spec
- [ ] Write `.gitignore`
- [ ] Write `.env.example` with all keys empty/dummy
- [ ] Write `docker-compose.yml`
- [ ] Verify `docker compose up -d postgres` brings Postgres up; `psql $DATABASE_URL -c '\l'` works
- [ ] Install cross-cutting agent skills (BetterAuth ×3, Vite, Biome) — see [§4](#4-agent-skills)
- [ ] `git add .claude/skills/` and commit so installed skills are tracked

**Verification:** `git status` clean after first commit; `docker compose ps` shows postgres healthy; `.claude/skills/` contains the 5 installed skills.

---

### Phase 1 — Design System + Frontend Skeleton

**Goal:** generate the Vite app and the shadcn design system, then restructure to the flat `packages/*` layout and add Biome as the only formatter/linter.

**Files Created (by shadcn init):** `pnpm-workspace.yaml`, root `package.json`, `tsconfig.base.json`, `apps/web/**`, `packages/ui/**`.

**Files Renamed/Moved:**
- `apps/web` → `packages/frontend`
- `packages/ui` → `packages/design-system`

**Files Modified:**
- `pnpm-workspace.yaml` → `packages: ['packages/*']` (drop `apps/*`)
- `packages/frontend/package.json` → `name: "@vamp-bills/frontend"`; remove ESLint/Prettier deps and `lint` script
- `packages/design-system/package.json` → **keep** `name: "@workspace/ui"`
- Root `package.json` → add `format` / `lint` / `check` scripts using Biome

**Files Created (new):**
- `biome.json` (root)

**Files Deleted:**
- Anything ESLint/Prettier shadcn or Vite scaffolded: `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `.prettierignore` (in repo root and inside `packages/frontend`)

**Tasks:**
- [ ] Run `pnpm dlx shadcn@latest init --preset b3STOl8d7 --base base --template vite --monorepo --rtl --pointer --name vamp-bills`
- [ ] `pnpm install` — confirm install succeeds and the default Vite app boots via `pnpm --filter web dev`
- [ ] Move directories: `apps/web` → `packages/frontend`, `packages/ui` → `packages/design-system`; delete empty `apps/`
- [ ] Edit `pnpm-workspace.yaml` to `packages: ['packages/*']`
- [ ] Rename frontend package to `@vamp-bills/frontend`; leave design-system as `@workspace/ui`
- [ ] `pnpm add -Dw @biomejs/biome && pnpm dlx @biomejs/biome init` then customize `biome.json`
- [ ] Remove ESLint + Prettier configs and deps; add Biome scripts to root `package.json`
- [ ] `pnpm install` again to refresh symlinks
- [ ] Smoke: `pnpm --filter @vamp-bills/frontend dev` → default page renders; `pnpm check` passes

**Verification:** Vite dev server boots from `packages/frontend`; `@workspace/ui` import resolves; `pnpm check` exits 0.

---

### Phase 2 — Backend Skeleton

**Goal:** create `packages/backend` with Express + tRPC + Drizzle + BetterAuth, exposing one `health` procedure and the auth handler. The `AppRouter` type must be importable type-only by the frontend.

**Files Created (`packages/backend/`):**
- `package.json` (name `@vamp-bills/backend`; deps: `express`, `cors`, `@trpc/server`, `zod`, `drizzle-orm`, `pg`, `better-auth`, `tsx`, `drizzle-kit`, `@types/express`, `@types/pg`, `typescript`); `exports` field exposes `./trpc/router` for type-only import
- `tsconfig.json` (extends `../../tsconfig.base.json`)
- `drizzle.config.ts` (schema at `./src/db/schema.ts`, migrations at `./drizzle/`)
- `src/index.ts` (Express app; `cors`; mounts `/trpc` via `createExpressMiddleware`, `/api/auth/*` via `toNodeHandler(auth)`; listens on `:3000`)
- `src/trpc/trpc.ts` (`initTRPC.context<Context>().create()`; `router`, `publicProcedure`, `protectedProcedure`)
- `src/trpc/context.ts` (`createContext({ req })` → `{ user: auth.api.getSession({ headers: req.headers }) ?? null }`)
- `src/trpc/router.ts` (`appRouter = router({ health: publicProcedure.query(() => ({ ok: true, ts: Date.now() })) })`; `export type AppRouter = typeof appRouter`)
- `src/auth.ts` (`betterAuth({ database: drizzleAdapter(db, { provider: 'pg' }), emailAndPassword: { enabled: true }, socialProviders: { google: { clientId, clientSecret } }, baseURL: env.BETTER_AUTH_URL, secret: env.BETTER_AUTH_SECRET })`)
- `src/db/client.ts` (`drizzle(new pg.Pool({ connectionString: env.DATABASE_URL }), { schema })`)
- `src/db/schema.ts` (placeholder — BetterAuth-generated tables added on first `auth:generate`)
- `src/env.ts` (zod-validated env loader)

**Tasks:**
- [ ] Scaffold `packages/backend/` with `package.json` and `tsconfig.json`
- [ ] Install deps via `pnpm --filter @vamp-bills/backend add ...`
- [ ] Implement `db/client.ts`, `auth.ts`, `trpc/{trpc,context,router}.ts`, `index.ts`
- [ ] Add scripts: `dev: tsx watch src/index.ts`, `build: tsc`, `db:generate: drizzle-kit generate`, `db:push: drizzle-kit push`, `auth:generate: better-auth generate --output src/db/auth-schema.ts`
- [ ] Run `pnpm db:up && pnpm auth:generate && pnpm db:push` — verify BetterAuth tables (`user`, `session`, `account`, `verification`) appear in pg
- [ ] Run `pnpm --filter @vamp-bills/backend dev`; `curl http://localhost:3000/trpc/health` returns `{"result":{"data":{"ok":true,"ts":...}}}`
- [ ] `curl -X POST http://localhost:3000/api/auth/sign-up/email -H 'content-type: application/json' -d '{"email":"x@y.z","password":"too-short"}'` returns a validation error (not 404) — confirms BetterAuth wired
- [ ] Install backend agent skills (Drizzle ORM, Drizzle migrations, tRPC) — see [§4](#4-agent-skills)
- [ ] `git add .claude/skills/` and commit

**Verification:** Both endpoints respond as expected; `pnpm --filter @vamp-bills/backend build` compiles clean; backend skills present in `.claude/skills/`.

---

### Phase 3 — Frontend Wiring

**Goal:** install the TanStack stack, tRPC client, and BetterAuth client in the frontend, and prove the FE↔BE roundtrip by rendering the value of `trpc.health.useQuery()` on the index route.

**Files Modified:**
- `packages/frontend/package.json` — add deps: `@tanstack/react-router`, `@tanstack/router-plugin`, `@tanstack/react-query`, `@trpc/client`, `@trpc/tanstack-react-query`, `@tanstack/react-form`, `@tanstack/react-table`, `zod`, `better-auth`; add `@vamp-bills/backend: workspace:*` as devDependency for type-only `AppRouter` import
- `packages/frontend/vite.config.ts` — add `TanStackRouterVite()` plugin; add `server.proxy['/trpc']` and `server.proxy['/api/auth']` → `http://localhost:3000`
- `packages/frontend/src/main.tsx` — wrap root in `QueryClientProvider` and `RouterProvider`

**Files Created:**
- `packages/frontend/src/lib/trpc.ts` — `createTRPCClient<AppRouter>` with `httpBatchLink({ url: '/trpc' })`; `createTRPCOptionsProxy` for React Query integration. Type-only: `import type { AppRouter } from '@vamp-bills/backend/trpc/router'`
- `packages/frontend/src/lib/auth-client.ts` — `createAuthClient({ baseURL: '/api/auth' })` from `better-auth/react`
- `packages/frontend/src/routes/__root.tsx` — root layout with `<Outlet />`
- `packages/frontend/src/routes/index.tsx` — calls `trpc.health.useQuery()`, renders `ok` and `ts`

**Tasks:**
- [ ] Add deps and re-install
- [ ] Configure Vite plugin + proxy
- [ ] Implement `lib/trpc.ts` and `lib/auth-client.ts`
- [ ] Create `routes/__root.tsx` and `routes/index.tsx`; let TanStack Router plugin generate `routeTree.gen.ts`
- [ ] Wire providers in `main.tsx`
- [ ] Smoke: open `http://localhost:5173` — page renders shadcn-styled, displays the `health` payload
- [ ] Run `npx -y @tanstack/intent install` (verify exact command at [`tanstack.com/intent/latest/docs`](https://tanstack.com/intent/latest/docs)) — auto-discovers TanStack skills shipped inside `@tanstack/*` packages and installs them into `.claude/skills/`
- [ ] `git add .claude/skills/` and commit

**Verification:** Browser shows `{ ok: true, ts: <number> }` on the index route; no console errors; type narrowing works (hover over `data` in the IDE → typed shape from backend); `.claude/skills/` contains TanStack Router/Query/Form/Table skills.

---

### Phase 4 — Local End-to-End Verification

**Goal:** confirm `pnpm install && pnpm db:up && pnpm dev` brings up the full stack on a fresh clone, that builds compile clean, and that `pnpm check` passes — *locally*. Deployment is Phase 5.

**Files Modified:**
- Root `package.json` — final pass on scripts: `dev`, `build`, `format`, `lint`, `check`, `db:up`, `db:generate`, `db:push`, `auth:generate`
- `.claude/specs/BOILERPLATE_SCAFFOLDING_SPEC.md` — Phase 4 completion report appended (per `tracking-completion-reports`)

**Tasks:**
- [ ] Fresh-clone simulation: delete `node_modules` and `pnpm-lock.yaml`; re-run `pnpm install && pnpm db:up && pnpm auth:generate && pnpm db:push && pnpm dev`
- [ ] Confirm both packages start in parallel via `pnpm -r --parallel dev`
- [ ] `pnpm build` — both compile clean
- [ ] `pnpm check` — Biome exits 0 across the tree
- [ ] Append phase completion reports to the spec file (per Phase 0–3 results)
- [ ] Mark spec status → `COMPLETED` and update Last Updated date

**Verification:** matches the local-only items in [§7](#7-success-criteria).

---

### Phase 5 — Deploy to Vercel + Neon

**Goal:** ship the boilerplate to a public Vercel URL backed by a Neon Postgres database. The same `health` roundtrip and BetterAuth handler that work on `localhost` must work on the deployed URL — no business logic added, just hosting.

**Prerequisites (one-time, manual, outside the repo):**
- Vercel account on the free Hobby tier
- Neon account on the free tier
- A Google Cloud Console project with an OAuth 2.0 Client ID (web app) — needed for the Google sign-in flow

**Files Created (`/`):**
- `vercel.json` — build config (`installCommand: pnpm install --frozen-lockfile`, `buildCommand: pnpm --filter @vamp-bills/frontend build`, `outputDirectory: packages/frontend/dist`); `rewrites` for `/trpc/(.*)` and `/api/auth/(.*)` → `/api/index`; `functions` config so the serverless function bundles `packages/backend` deps
- `api/index.ts` — Vercel serverless entry that imports the Express `app` from `@vamp-bills/backend` and re-exports it as the default handler. Vercel's Node runtime accepts an Express app directly as a handler
- `.vercelignore` — excludes `docs/`, `scripts/`, `.venv/`, `.claude/specs/`, etc. from the deploy upload

**Tasks:**
- [ ] Create Neon project; copy `DATABASE_URL` (the pooled, prod-mode one)
- [ ] Run `auth:generate && db:push` against the Neon URL to materialize BetterAuth tables (`user`, `session`, `account`, `verification`) in Neon — verify with `psql $NEON_URL -c '\dt'`
- [ ] Create Vercel project, connect the git repo (Vercel auto-detects `pnpm` and the build will fail until `vercel.json` lands — that's fine, fix in next step)
- [ ] Author root `vercel.json` with `installCommand` / `buildCommand` / `outputDirectory` / `rewrites` / `functions`
- [ ] Author root `api/index.ts` exporting the Express app as the default handler; ensure it imports from `@vamp-bills/backend` (workspace package) so the Vercel function bundles backend code
- [ ] Set Vercel project env vars: `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `BETTER_AUTH_URL` (the Vercel deployment URL, e.g. `https://vamp-bills.vercel.app`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] In Google Cloud Console: add `https://<vercel-url>/api/auth/callback/google` to the OAuth client's authorized redirect URIs; add `https://<vercel-url>` to authorized JavaScript origins
- [ ] Push to main (or `vercel --prod`) — first deploy
- [ ] Smoke: open `https://<vercel-url>/` — page renders shadcn-themed and shows `{ ok: true, ts: <number> }` from `trpc.health.useQuery()`
- [ ] Smoke auth: `curl -X POST https://<vercel-url>/api/auth/sign-up/email -H 'content-type: application/json' -d '{}'` → BetterAuth validation error (not 404, not 502)
- [ ] Smoke OAuth: visit `https://<vercel-url>/api/auth/sign-in/social/google` in browser — should redirect to Google's consent screen
- [ ] Append Phase 5 completion report; mark spec status → `COMPLETED`

**Verification:** the deployment URL passes the same three smoke tests as local Phase 4 — `/` renders the health payload, `/api/auth/sign-up/email` responds with BetterAuth JSON, `/api/auth/sign-in/social/google` redirects to Google.

**Risks / known caveats:**
- Express in a Vercel serverless function works but cold starts add ~500–1500ms on first request after idle. Acceptable for a demo.
- Single-project monorepo deploys with pnpm + a serverless function require the `functions` glob in `vercel.json` to include `packages/backend/**` so deps are bundled. If bundling proves flaky, fall back to splitting into two Vercel projects (one for `packages/frontend`, one for `packages/backend` set to "Other Framework Preset"). Document the choice in the completion report.
- Neon free tier auto-suspends after ~5 min of inactivity; first query after a suspend takes ~500ms to wake. Fine for a demo.

---

## 6. Testing Strategy

There are no automated tests in this scaffolding pass — that's a separate concern, intentionally out of scope. Verification is manual but reproducible:

| Layer | What to verify | How |
|---|---|---|
| Workspace | All 3 packages discoverable | `pnpm -r ls --depth -1` lists `@workspace/ui`, `@vamp-bills/frontend`, `@vamp-bills/backend` |
| Postgres | DB reachable | `pnpm db:up`, then `psql $DATABASE_URL -c '\dt'` |
| BetterAuth schema | Tables present | After `pnpm auth:generate && pnpm db:push`, expect `user`, `session`, `account`, `verification` |
| Backend boot | tRPC reachable | `curl localhost:3000/trpc/health` → `{ok:true,...}` |
| Backend boot | Auth reachable | `curl -X POST localhost:3000/api/auth/sign-up/email` → validation error JSON, not 404 |
| Frontend boot | Vite + Tailwind | `pnpm dev` → `localhost:5173` renders themed shadcn page |
| Type safety | `AppRouter` flows to client | IDE shows typed `data` from `trpc.health.useQuery()` |
| Tooling | Lint/format | `pnpm check` exits 0 |
| Builds | tsc clean | `pnpm build` succeeds in both packages |

**Regression concerns:** none — greenfield repo. The only "regression" risk is the rename step (`apps/web` → `packages/frontend`); guard it with the `pnpm --filter @vamp-bills/frontend dev` smoke after the rename.

---

## 7. Success Criteria

All of the following must be true to call the boilerplate done:

- [ ] `pnpm-workspace.yaml` lists exactly `packages/*`; three packages discovered: `@workspace/ui`, `@vamp-bills/frontend`, `@vamp-bills/backend`
- [ ] `pnpm install && pnpm db:up && pnpm auth:generate && pnpm db:push && pnpm dev` succeeds from a clean clone
- [ ] `http://localhost:5173/` renders a shadcn-themed page that shows `{ ok: true, ts: <number> }` from a typed `trpc.health.useQuery()` call
- [ ] `curl -X POST http://localhost:3000/api/auth/sign-up/email -H 'content-type: application/json' -d '{}'` returns a JSON error from BetterAuth (proves it's mounted and live), not a 404
- [ ] `pnpm build` compiles both packages with `tsc` clean
- [ ] `pnpm check` (Biome) exits 0
- [ ] No ESLint, Prettier, or related dependencies remain in any `package.json`
- [ ] Spec file at `.claude/specs/BOILERPLATE_SCAFFOLDING_SPEC.md` has Status `COMPLETED` with phase completion reports
- [ ] `.claude/skills/` contains all skills listed in [§4](#4-agent-skills): the 5 cross-cutting skills (Phase 0), the 3 backend skills (Phase 2), and the TanStack Intent-discovered skills (Phase 3)
- [ ] **Public Vercel URL** serves the same shadcn-themed page with `{ ok: true, ts: ... }` from a typed `trpc.health.useQuery()` call against the Neon Postgres backend
- [ ] **Public auth endpoints** respond on the deployed URL: `/api/auth/sign-up/email` returns BetterAuth JSON, `/api/auth/sign-in/social/google` redirects to Google's consent screen

---

## 8. Non-Goals

Explicit Non-Goals (per `workflow-collaboration-loop` — prevents scope creep):

- **No application entities** — Bills, Vendors, Payments, Line Items schemas, types, or procedures
- **No lifecycle state machine** — bill state transitions, payment state transitions
- **No intake flows** — Manual / CSV / AI invoice fill UIs and handlers
- **No file upload endpoint** — AI invoice fill is deferred; the future REST/multipart route is post-MVP
- **No production hardening** — deployment is in scope (Phase 5: Vercel + Neon), but custom domain, preview-env protection, monitoring/alerting, log aggregation, and rate limiting are not. Demo-grade only.
- **No CI** — GitHub Actions, preview envs, etc.
- **No automated tests** — unit, integration, e2e all out of scope for this pass
- **No login UI** — BetterAuth is mounted, but no sign-in/sign-up pages are built
- **No theme switcher / dark mode toggle** — design tokens exist, no UI to flip them
- **No data seeding** — no demo users/vendors/bills seeded

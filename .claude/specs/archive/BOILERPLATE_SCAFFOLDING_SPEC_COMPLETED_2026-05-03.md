# Boilerplate Scaffolding Specification

**Status:** COMPLETED — boilerplate live on Vercel + Neon
**Created:** 2026-05-02
**Last Updated:** 2026-05-03
**Phase 0 Completed:** 2026-05-02
**Phase 1 Completed:** 2026-05-02
**Phase 2 Completed:** 2026-05-03
**Phase 3 Completed:** 2026-05-03
**Phase 4 Completed:** 2026-05-03
**Phase 5 Completed:** 2026-05-03
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

**Vercel deployment shape (Phase 5 implements this):**
- **Production branch:** `main` — Vercel auto-deploys to the canonical demo URL.
- **Preview branch:** `develop` and every PR get their own preview URL (free Vercel hobby tier behavior).
- Vite SPA → Vercel static output (default Vite preset).
- Express backend → wrapped as a single Vercel serverless function via `api/index.ts` that re-exports the Express `app`. `vercel.json` rewrites `/trpc/*` and `/api/auth/*` to that function.
- Postgres → Neon free tier, `DATABASE_URL` set as a Vercel env var (single DB shared by prod + previews — fine for demo; in real apps preview deploys would use a branched DB).
- BetterAuth `BETTER_AUTH_URL` set per-environment (production = canonical Vercel URL; previews can fall back to `VERCEL_URL`); Google OAuth redirect added for the canonical production URL.

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

# Phase 3 — TanStack via intent (auto-discovered after `pnpm add @tanstack/* @trpc/*`)
# `intent install` is one-time, already done in Phase 0/2 (writes the loading-guidance
# block to AGENTS.md). On subsequent phases just verify with `intent list`:
npx @tanstack/intent@latest list   # confirms newly-installed packages publish skills
```

### Two skill loading models in use

The repo mixes two complementary mechanisms — keep them straight:

| Model | Used for | How content reaches the agent |
|---|---|---|
| **`npx skills add`** (Phase 0/2 — BetterAuth, Drizzle, tRPC type-safety, etc.) | Curated, version-stable best-practices guides published as separate GitHub repos | Symlinks `SKILL.md` files into `.claude/skills/`, content always loaded into the agent's context |
| **TanStack Intent** (Phase 3 onward — `@trpc/*`, `@tanstack/*` packages) | Skills shipped *inside* the npm package itself (in `node_modules`), version-aligned with the installed code | On-demand: `npx @tanstack/intent@latest load <pkg>#<skill>` fetches `SKILL.md` per task. Loading guidance in `AGENTS.md` tells the agent when to call it. **No symlinks under `.claude/skills/`.** |

> **Verify before installing each.** Per `find-skills` guidance: re-check install count and source reputation when running. If a skill has dropped or a better one has appeared, update this list. Update the skill list in the spec (per `spec-living-document`) if substitutions are made.

---

## 5. Implementation Plan

### Progress Tracker

- [x] **Phase 0: Repo Foundation** — git init, .gitignore, .env.example, docker-compose, agent skills, spec — **COMPLETED 2026-05-02** (commit `f04c827`)
- [x] **Phase 1: Design System + Frontend Skeleton** — shadcn init, restructure to flat `packages/*`, Biome — **COMPLETED 2026-05-02** (PR #1 squash-merged into `develop` as `c1e9f4c`)
- [x] **Phase 2: Backend Skeleton** — Express + tRPC + Drizzle + BetterAuth, `health` procedure — **COMPLETED 2026-05-03**
- [x] **Phase 3: Frontend Wiring** — TanStack stack, tRPC/auth clients, index route hits `health` — **COMPLETED 2026-05-03**
- [x] **Phase 4: Local End-to-End Verification** — DB up, auth tables, full roundtrip, builds clean — **COMPLETED 2026-05-03**
- [x] **Phase 5: Deploy to Vercel + Neon** — single Vercel project (frontend + Express serverless), Neon Postgres, public URL serves the same `health` roundtrip — **COMPLETED 2026-05-03**

**Branch model** (per [`docs/contributing.md`](../../docs/contributing.md)):
- `main` — production; Vercel deploys from here. Protected: PRs only.
- `develop` — default integration branch; preview deploys.
- `feature/boilerplate-phase{N}` → PR → `develop` → (when releasing) PR → `main`.

Phase 0 shipped as the initial commit on `main` (before protection was enabled), then mirrored to `develop`. Phases 1–5 each land on `feature/boilerplate-phase{N}`, PR into `develop`, squash-merged. The whole boilerplate gets a single develop → main release at the end (or after Phase 4 if Phase 5 splits into its own deploy ticket).

---

### Phase 0 — Repo Foundation

**Goal:** establish the repo's outermost shell — version control, environment template, database, and the spec itself — so subsequent phases have a place to land.

**Files Created:**
- `.gitignore` (Node + venv + .env + dist + .turbo)
- `.env.example` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- `docker-compose.yml` (single `postgres:16` service, volume `pgdata`, port `5432`)
- `.claude/specs/BOILERPLATE_SCAFFOLDING_SPEC.md` (this spec — already created during planning, committed in Phase 0)

**Tasks:**
- [x] `git init` at repo root; initial commit captures the existing `docs/`, `scripts/`, plus the Phase 0 work and this spec (`.venv/` deliberately gitignored as it's a Python venv, not source)
- [x] Write `.gitignore` (Node + macOS + Python + agent-tool noise)
- [x] Write `.env.example` with all keys (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- [x] Write `docker-compose.yml` (postgres:16-alpine, port 5432, healthcheck)
- [x] Verify `docker compose up -d postgres` brings Postgres up healthy (status: `Up (healthy)`, `pg_isready` accepting connections)
- [x] Install cross-cutting agent skills (BetterAuth ×3, Vite, Biome) — installed via `npx skills add`, canonical files at `.agents/skills/`, Claude Code symlinks at `.claude/skills/`
- [x] Commit Phase 0 as the initial commit on `main` (commit `f04c827`)

**Verification:** ✅ `git status` clean after commit; `docker compose ps` shows postgres `Up (healthy)`; `.claude/skills/` contains all 5 newly installed skills as symlinks into `.agents/skills/`.

#### Phase 0 Completion Report

**Completion Date:** 2026-05-02
**Status:** SUCCESSFUL
**Commit:** `f04c827` (initial commit on `main`)
**Actual Effort:** ~10 minutes

##### Summary
Bootstrapped the repo from "docs only" to a clean initial commit on `main` containing version control, environment template, Postgres via docker-compose, and 5 agent skills installed.

##### Key Achievements
- Postgres reachable on `:5432` with healthcheck passing (~5s from `up -d` to healthy)
- All 5 cross-cutting agent skills installed and symlinked into `.claude/skills/`
- `.gitignore` carved out the noise: 22+ extraneous agent-tool config dirs that `npx skills add` creates (`.codebuddy/`, `.continue/`, etc.) are excluded; only the canonical `.agents/skills/` and Claude Code's `.claude/` are tracked
- Spec committed as the project's living reference

##### Files Changed
- Created: 152 files (+54,355 lines) — bulk is the bundled skill markdown content (each skill ships with a SKILL.md and supporting docs) + the existing Excalidraw diagram (2,119 lines)
- Of those, the actual *Phase 0 boilerplate*: `.gitignore`, `.env.example`, `docker-compose.yml`, `AGENTS.md`, `skills-lock.json`, plus `.claude/specs/BOILERPLATE_SCAFFOLDING_SPEC.md` (~500 lines)

##### Issues Encountered & Decisions
1. **`npx skills add` creates 22+ unused agent-tool dirs.** The `skills` CLI scaffolds dirs for every supported agent (Cursor, Continue, Codex, etc.) even though we only use Claude Code. Resolution: gitignored all of them; canonical content lives in `.agents/skills/`, Claude Code reads from `.claude/skills/` via symlinks, and `skills-lock.json` lets the others be re-scaffolded with `npx skills add` if a collaborator needs them.
2. **Phase 0 ships as the initial main commit, not a feature branch.** A `feature/boilerplate-phase0` PR has nothing to merge against on a brand-new repo. Phases 1–5 will follow the `feature/boilerplate-phase{N}` branch+PR pattern as planned.
3. **`.venv/` deliberately gitignored.** The original spec's "first commit captures `.venv/`" line was wrong — Python venvs are environment-specific and should not be checked in. The Playwright scraper in `scripts/` can be re-bootstrapped from a future `requirements.txt` (out of scope here).

##### Skills Installed (with hashes from `skills-lock.json`)
| Skill | SHA |
|---|---|
| `better-auth-best-practices` | `a4c83050…2c2a6dc` |
| `better-auth-security-best-practices` | `5717187b…d8b8c915` |
| `email-and-password-best-practices` | (in lockfile) |
| `vite` | (in lockfile) |
| `biome-developer` | `3a9e05cb…71a510a513` |

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
- [x] Run `pnpm dlx shadcn@latest init --preset b3STOl8d7 --base base --template vite --monorepo --rtl --pointer --name vamp-bills`
- [x] Unwrap nested `vamp-bills/` directory created by the `--name` flag (move contents up one level, drop the inner `.git`)
- [x] Move directories: `apps/web` → `packages/frontend`, `packages/ui` → `packages/design-system`; delete empty `apps/`
- [x] Edit `pnpm-workspace.yaml` to `packages: ['packages/*']` and add `onlyBuiltDependencies: [esbuild]` for pnpm 10
- [x] Rename frontend package to `@vamp-bills/frontend`; leave design-system as `@workspace/ui`
- [x] Add `@biomejs/biome` to root devDeps; write `biome.json` with Tailwind directives enabled and shadcn/agent dirs ignored
- [x] Remove ESLint + Prettier configs and deps from all package.json files; root `prettier`, `prettier-plugin-tailwindcss` removed; per-package `eslint.config.js` deleted
- [x] Add Biome scripts to root `package.json`: `format`, `lint`, `check`; replace turbo orchestration with `pnpm -r [--parallel]` (Turbo was dropped in a follow-up commit — see decision #6 below)
- [x] Replace shadcn's generic README.md with a vamp-bills project README
- [x] Smoke: Vite dev server boots and serves on `localhost:5173` (HTTP 200); `pnpm check` exits 0; `pnpm typecheck` passes both packages; `pnpm build` produces a 233 KB JS / 22 KB CSS frontend bundle

**Verification:** ✅ All green — see Phase 1 Completion Report below.

#### Phase 1 Completion Report

**Completion Date:** 2026-05-02
**Status:** SUCCESSFUL
**Branch:** `feature/boilerplate-phase1` (PR'd into `develop`)
**Actual Effort:** ~30 minutes

##### Summary
Generated the shadcn monorepo via the preset, restructured to the flat `packages/*` layout, and replaced shadcn's bundled ESLint + Prettier with Biome 2 as the single format/lint tool. Frontend dev server, build, and typecheck all green.

##### Key Achievements
- 2 packages live: `@workspace/ui` (design system) and `@vamp-bills/frontend` (Vite app)
- Frontend builds to ~233 KB JS + 22 KB CSS gzipped — within budget
- Biome 2.4.14 replaces ~7 ESLint/Prettier dependencies with one tool
- Turbo retained from shadcn's template — caches typecheck/build across packages

##### Files Changed
- Created: ~70 files including the shadcn primitives at `packages/design-system/src/components/`, the Vite app at `packages/frontend/src/`, root config (`package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `turbo.json`, `biome.json`, `.npmrc`)
- Modified: `.gitignore` (added `.pnp`, `.pnp.js`, `*.pem`)
- Replaced: `README.md` (shadcn template → vamp-bills project README)
- Deleted (vs shadcn defaults): `eslint.config.js` × 2, `.prettierrc`, `.prettierignore`, all `eslint-*` deps, `prettier`, `prettier-plugin-tailwindcss`

##### Issues Encountered & Decisions
1. **`--name vamp-bills` nested everything in a `vamp-bills/` subdir** with its own `.git/`. Resolution: deleted the inner `.git`, moved all files up one level, deleted shadcn's `.gitignore` (kept ours which already had the agent-tool exclusions), merged in shadcn-specific patterns (`.pnp`, `.pnp.js`, `*.pem`).
2. **pnpm 10 ignores postinstall scripts by default** for security; without explicit approval esbuild's native binary isn't downloaded → Vite would fail at runtime. Added `onlyBuiltDependencies: [esbuild]` to `pnpm-workspace.yaml` and ran `pnpm rebuild esbuild` to materialize the binary.
3. **Biome's CSS parser rejected `@apply` (Tailwind directive) by default.** Fix: `css.parser.tailwindDirectives: true` in `biome.json`.
4. **Biome's `noNonNullAssertion` flagged shadcn's idiomatic `getElementById("root")!` in `main.tsx`.** Resolution: added a single `// biome-ignore` comment with rationale (`index.html guarantees #root exists`); kept the rule on globally.
5. **Schema version mismatch warning.** Updated `biome.json`'s `$schema` URL from `2.2.0` to `2.4.14` to match the installed Biome.
6. **Dropped `turbo`** from shadcn's template after reviewing. The original spec just said "pnpm workspaces", and on inspection: `pnpm -r --parallel <script>` covers our parallel-dev needs, the design system is source-imported (no build dep graph for turbo to resolve), and the typecheck cache (~1.5s saved) doesn't justify the dep for a project this size. Re-adding `turbo.json` is a 5-min job in Phase 5 if Vercel's Remote Cache materially speeds up deploys.
7. **Enabled React Compiler + upgraded to Vite 8.** Added `babel-plugin-react-compiler` so React 19's auto-memo handles `useMemo`/`useCallback`/`React.memo` for us. Two integration notes with Vite 8:
   - **`@vitejs/plugin-react` v6 dropped its `babel` option** (refresh transform moved to Oxc). React Compiler now runs as a separate Babel pass via **`@rolldown/plugin-babel`** (the Rolldown-native integration; *not* the legacy `vite-plugin-babel`). The native version is ~40% faster (build: 524ms → 311ms) and avoids an `optimizeDeps.esbuildOptions` deprecation warning.
   - **`@vitejs/plugin-react` exports `reactCompilerPreset`** ready-made for `@rolldown/plugin-babel` — it bundles the TS parser and the rolldown file filter internally, so the wiring is a one-liner. Final config: `[react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()]`. Bundle: 234 → 231 KB JS, CSS: 22 → 23 KB.
8. **Switched to Vite 8's `resolve.tsconfigPaths: true`.** Replaces the manual `resolve.alias` block in `vite.config.ts` — single source of truth for path aliases (now defined only in `tsconfig.json`/`tsconfig.app.json`). Also fixed a stale `@workspace/ui/*` path mapping that still pointed at the pre-rename `packages/ui/src/*` — workspace packages resolve via the package's `exports` map, so the explicit path mapping wasn't needed and was removed.
9. **Added GitHub Actions CI** (`.github/workflows/ci.yml`): runs `biome ci`, `pnpm -r lint:eslint`, `pnpm typecheck`, and `pnpm build` on every PR to `develop`/`main` and every push to those branches. Uses pnpm and Node 20 with concurrency cancel-in-progress.
10. **Removed dead `/* eslint-disable react-refresh/only-export-components */`** from `theme-provider.tsx` — leftover from shadcn's ESLint setup, meaningless now that we're on Biome.
11. **Added ESLint 10 alongside Biome** for type-aware/React-specific rules Biome can't replicate. Per-package flat configs at `packages/{frontend,design-system}/eslint.config.mjs`, root sentinel at `eslint.config.mjs` (returns `[]`). Plugin set: `typescript-eslint`, `eslint-plugin-react-hooks` v7, `eslint-plugin-react-compiler` — deliberately *without* `eslint-plugin-react` (its current stable release isn't ESLint 10 compatible; most of its rules overlap with Biome anyway). Mailberry uses `eslint-plugin-react` on ESLint 9 — we deviate intentionally to be on ESLint 10. If type-aware rules are needed later, switch from `tseslint.configs.recommended` to `recommendedTypeChecked` and add `parserOptions.project: true`. Root scripts: `lint` runs both Biome and ESLint; `check` does Biome auto-fix + ESLint.
12. **Upgraded to TypeScript 6.0.3** across all packages. The 6.0 migration is small for our setup: the only change is dropping `baseUrl` from `tsconfig.json` / `tsconfig.app.json` (deprecated in 6.0, gone in 7.0) — `paths` still work, just relative to the tsconfig file's directory. We were already on `moduleResolution: bundler`, `module: ESNext`, and `strict: true`, all of which match TS 6 defaults. TypeScript pinned to exact `6.0.3` (no caret) in all `package.json` files to prevent future drift.

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
- [ ] Add scripts: `dev: tsx watch src/index.ts`, `build: tsc`, `db:generate: drizzle-kit generate`, `db:push: drizzle-kit push`, `auth:generate: better-auth generate --output src/db/auth-schema.ts --yes` (the `better-auth` binary is provided by the `@better-auth/cli` dev dep, not the `better-auth` runtime package)
- [ ] Run `pnpm db:up && pnpm auth:generate && pnpm db:push` — verify BetterAuth tables (`user`, `session`, `account`, `verification`) appear in pg
- [ ] Run `pnpm --filter @vamp-bills/backend dev`; `curl http://localhost:3000/trpc/health` returns `{"result":{"data":{"ok":true,"ts":...}}}`
- [ ] `curl -X POST http://localhost:3000/api/auth/sign-up/email -H 'content-type: application/json' -d '{"email":"x@y.z","password":"too-short"}'` returns a validation error (not 404) — confirms BetterAuth wired
- [ ] Install backend agent skills (Drizzle ORM, Drizzle migrations, tRPC) — see [§4](#4-agent-skills)
- [ ] `git add .claude/skills/` and commit

**Verification:** Both endpoints respond as expected; `pnpm --filter @vamp-bills/backend build` compiles clean; backend skills present in `.claude/skills/`.

#### Phase 2 Completion Report

**Completion Date:** 2026-05-03
**Status:** SUCCESSFUL
**Branch:** `feature/boilerplate-phase2` → PR'd into `develop`
**Actual Effort:** ~45 minutes

##### Summary
Stood up `packages/backend` (`@vamp-bills/backend`) with Express 5 + tRPC 11 + Drizzle ORM + BetterAuth. Local stack: `pnpm db:up && pnpm auth:generate && pnpm db:push && pnpm --filter @vamp-bills/backend dev` brings up Postgres with the four BetterAuth tables and a tRPC server on `:3000` whose `health` procedure returns `{ ok, ts }` and whose `/api/auth/*splat` endpoints respond with BetterAuth JSON.

##### Key Achievements
- 13 files of source under `packages/backend/`; package's `exports` map exposes `./trpc/router` for type-only consumption by the frontend (Phase 3 will add a workspace-level dev-dep + type-only `import type { AppRouter }`).
- Three root scripts delegate to backend: `db:generate`, `db:push`, `auth:generate`. Existing `db:up` + `db:down` already covered docker postgres.
- BetterAuth-generated schema is the only schema for now; re-exported from `src/db/schema.ts` so application tables (Bills/Vendors/Payments) can be added alongside in a follow-up.
- All workspace gates green: `pnpm typecheck`, `pnpm check` (Biome + ESLint per-package), `pnpm exec biome ci .`, `pnpm --filter @vamp-bills/backend build`.

##### Files Changed
- New: `packages/backend/{package.json, tsconfig.json, eslint.config.mjs, drizzle.config.ts}`, `packages/backend/src/{env.ts, auth.ts, index.ts}`, `packages/backend/src/db/{client.ts, schema.ts, auth-schema.ts}`, `packages/backend/src/trpc/{trpc.ts, context.ts, router.ts}`
- Modified: root `package.json` (3 scripts), `pnpm-lock.yaml`
- Skills added (3 symlinks under `.claude/skills/`, canonical content under `.agents/skills/`): `drizzle-orm`, `trpc`, `postgres-drizzle`
- Spec: this completion report + Progress Tracker checkbox + Last Updated bump

##### Issues & Decisions

1. **BetterAuth ↔ CLI version skew.** Pinned `better-auth@1.4.21` (not `^1.6.x`) because `@better-auth/cli`'s latest stable is `1.4.21` and the CLI fails to load the auth config under 1.6.x (`better-call` peer mismatch — `kAPIErrorHeaderSymbol` not exported). Bump both together when the CLI catches up.
2. **`auth:generate` binary.** The `better-auth` CLI binary is provided by the `@better-auth/cli` dev-dep (not the `better-auth` runtime package). Spec line above amended.
3. **Express 5 wildcard syntax.** Mounted BetterAuth at `/api/auth/*splat` (named wildcard) — Express 5 dropped the bare `*` form. Easy to miss; `app.use('/api/auth', ...)` would also work but the explicit splat matches what `path-to-regexp@8` expects.
4. **Mount order in `src/index.ts`.** Both `toNodeHandler(auth)` and `createExpressMiddleware` read the raw request body, so the index.ts deliberately omits any global JSON body parser. CORS sits in front (default permissive — Phase 3 uses Vite proxy, so the browser sees same-origin and credentialed CORS isn't needed yet).
5. **Drizzle dialect string is `'postgresql'`** (Drizzle Kit) but BetterAuth's adapter uses `provider: 'pg'` — same DB, different libraries, easy to swap by mistake. Both pinned in source so future edits don't drift.
6. **Schema re-export pattern.** `src/db/schema.ts` re-exports `./auth-schema.ts`; the latter is overwritten by `auth:generate`. A pre-generate stub `export {};` keeps `tsc --noEmit` green on a fresh clone before `auth:generate` runs.
7. **Headers conversion for tRPC context.** Used `fromNodeHeaders(req.headers)` from `better-auth/node` instead of building a `Headers` object manually — keeps the context one-liner and avoids a `lib: ['DOM']` addition just for `HeadersInit`.
8. **Conditional Google OAuth.** `src/auth.ts` only includes the `socialProviders.google` block if both env vars are non-empty. Lets local dev (no Google credentials) work and lets Phase 5 light up Google by setting env vars on Vercel.
9. **Backend `build: tsc` is effectively a typecheck.** The base `tsconfig` has `noEmit: true`, which the backend tsconfig inherits. dev runs via `tsx`; Phase 5's Vercel deploy will compile through `@vercel/node`. Emitting JS via `tsc` would require overriding `noEmit` and disabling `allowImportingTsExtensions` — not worth the churn for a target that nothing currently consumes.
10. **Skills source substitution.** Original spec listed `bobmatnyc/claude-mpm-skills@{drizzle-orm, drizzle-migrations, trpc-type-safety}` — those have been removed from that repo (only `mcp-protocol-builder` ships now). Substituted with `mindrally/skills@drizzle-orm`, `mindrally/skills@trpc`, `ccheney/robust-skills@postgres-drizzle` (covers postgres + drizzle migrations), per spec §4's allowance.

##### Skills Installed (with hashes from `skills-lock.json`)
| Skill | Source |
|---|---|
| `drizzle-orm` | `mindrally/skills` |
| `trpc` | `mindrally/skills` |
| `postgres-drizzle` | `ccheney/robust-skills` |

---

### Phase 3 — Frontend Wiring

**Goal:** install the TanStack stack, tRPC client, and BetterAuth client in the frontend, and prove the FE↔BE roundtrip by rendering the value of `useQuery(trpc.health.queryOptions())` on the index route.

**Files Modified:**
- `packages/frontend/package.json` — add deps: `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/react-form`, `@tanstack/react-table`, `@trpc/client`, `@trpc/tanstack-react-query`, `zod` (preinstalled — unused in Phase 3, but the AppRouter type will reference it as soon as the first `.input(z.object(…))` validator lands on a backend procedure; pre-installing avoids a future install round at first use), `better-auth@1.4.21` (pinned in lockstep with the backend — see Phase 2 Decision #1); add devDeps `@tanstack/router-plugin` and `@vamp-bills/backend: workspace:*` (type-only via the backend's `exports.types`-only condition)
- `packages/frontend/vite.config.ts` — add `tanstackRouter({ target: 'react', autoCodeSplitting: true })` plugin **before** `react()` (so generated route imports are rewritten before React's Babel pass); add `server.proxy['/trpc']` and `server.proxy['/api/auth']` → `http://localhost:3000`
- `packages/frontend/src/main.tsx` — providers chain `ThemeProvider > QueryClientProvider > TRPCProvider > RouterProvider`
- *(no `.gitignore` change)* — `packages/frontend/src/routeTree.gen.ts` is regenerated on dev/build but is **committed** so workspace `tsc -b --noEmit` and `vite build` resolve `./routeTree.gen.ts` from `src/router.ts` without needing a pre-build codegen step in CI

**Files Created:**
- `packages/frontend/src/lib/trpc.ts` — `createTRPCContext<AppRouter>()` from `@trpc/tanstack-react-query`, exporting `TRPCProvider`, `useTRPC`, `useTRPCClient`. Type-only: `import type { AppRouter } from '@vamp-bills/backend/trpc/router'`
- `packages/frontend/src/lib/trpc-client.ts` — `createTRPCClient<AppRouter>` with `httpBatchLink({ url: '/trpc' })`. Split from `trpc.ts` so the React-side hooks can be imported without dragging the runtime client into module-init order
- `packages/frontend/src/lib/auth-client.ts` — `createAuthClient({ baseURL: '/api/auth' })` from `better-auth/react`
- `packages/frontend/src/lib/query-client.ts` — `new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } })`
- `packages/frontend/src/router.ts` — `createRouter({ routeTree })` plus `declare module '@tanstack/react-router' { interface Register { router: typeof router } }` for type-safe `<Link to="...">`
- `packages/frontend/src/routes/__root.tsx` — minimal root: `createRootRoute({ component: () => <Outlet /> })`
- `packages/frontend/src/routes/index.tsx` — `Route = createFileRoute('/')({ component: Home })`; `Home` calls `useQuery(trpc.health.queryOptions())` via `useTRPC()` and renders `ok` and `ts` alongside the preserved Phase 1 card layout

**Files Deleted:**
- `packages/frontend/src/App.tsx` — its layout moves into `routes/index.tsx`

**Tasks:**
- [ ] Add deps and re-install
- [ ] Configure Vite plugin + proxy + `.gitignore`
- [ ] Implement `lib/{trpc,trpc-client,auth-client,query-client}.ts` and `src/router.ts`
- [ ] Create `routes/__root.tsx` and `routes/index.tsx`; first `pnpm dev` generates `src/routeTree.gen.ts`
- [ ] Wire providers in `main.tsx`; delete `App.tsx`
- [ ] Smoke: open `http://localhost:5173` — page renders shadcn-styled, displays the `health` payload
- [ ] Run `npx @tanstack/intent@latest list` to confirm new skills are auto-discovered from `node_modules` (intent uses on-demand `intent load <pkg>#<skill>`; the loading guidance in `AGENTS.md` was already wired in Phase 0/2 — no symlinks under `.claude/skills/` get added)

**Verification:** Browser shows `{ ok: true, ts: <number> }` on the index route; no console errors; type narrowing works (hover over `data` in the IDE → typed `{ ok: boolean; ts: number }` from backend); `npx @tanstack/intent@latest list` shows the new `@trpc/client`, `@trpc/tanstack-react-query`, and `@tanstack/router-*` packages with their per-package skills (note: not all `@tanstack/*` packages publish skills via intent yet — `react-query`, `react-form`, `react-table` may not show up directly).

#### Phase 3 Completion Report

**Completion Date:** 2026-05-03
**Status:** SUCCESSFUL
**Branch:** `feature/boilerplate-phase3` → PR'd into `develop`
**Actual Effort:** ~30 minutes

##### Summary
Wired the frontend (`@vamp-bills/frontend`) to the Phase 2 backend. Browser at `http://localhost:5173` renders the preserved Phase 1 card with a live `{ ok: true, ts: <number> }` line populated from a typed tRPC roundtrip. The `AppRouter` type flows from backend to frontend via the workspace's type-only `exports` condition; no backend runtime code is bundled. Vite proxy makes `/trpc` and `/api/auth` same-origin from the browser, so default CORS + cookie behavior Just Works.

##### Key Achievements
- 8 new frontend source files (4 lib modules + router + 2 routes + main rewrite); App.tsx removed.
- TanStack Router file-based routing in place with `autoCodeSplitting: true` (47 KB code-split routes chunk in build).
- Frontend bundle: 337 KB JS / 23 KB CSS / 47 KB routes (gzipped: 105 KB / 5 KB / 16 KB) built in ~344 ms via Rolldown.
- `'d'` keypress dark-mode toggle from Phase 1 preserved through the providers chain.
- `npx @tanstack/intent@latest list` confirms `@trpc/client`, `@trpc/tanstack-react-query`, and `@tanstack/router-*` packages now publish their skills inline; the agent loads them on-demand via `intent load <pkg>#<skill>`.

##### Files Changed
- New: `packages/frontend/src/{lib/{trpc,trpc-client,auth-client,query-client}.ts, router.ts, routes/{__root,index}.tsx}`
- Modified: `packages/frontend/{package.json, vite.config.ts, src/main.tsx}`, root `package.json` (`engines.node` bumped to `>=20.19` to match TanStack Router's requirement)
- Deleted: `packages/frontend/src/App.tsx`
- Modified: spec Phase 3 section + §4 (skill model clarification), `README.md` (Stack table, Getting started, Scripts, proxy note)

##### Issues & Decisions
1. **v11 tRPC + React Query pattern.** Spec was written against the legacy `createTRPCReact()` API (`trpc.health.useQuery()`). Implementation uses the current `@trpc/tanstack-react-query` pattern: `createTRPCContext<AppRouter>()` exporting `TRPCProvider`/`useTRPC`, then `useQuery(trpc.health.queryOptions())` in components. Spec amended in this PR.
2. **lib/trpc split.** Rather than one `lib/trpc.ts`, we split into `trpc.ts` (React-side hooks) and `trpc-client.ts` (vanilla client). Keeps the hooks importable from any component without dragging the runtime client into module-init order. Provider chain in `main.tsx` wires both together.
3. **`better-auth@1.4.21` pinned (not `^latest`).** Versions of the BetterAuth client and server share types and cookie shape — bump in lockstep with the backend (Phase 2 Decision #1).
4. **`tanstackRouter()` plugin order.** Must run *before* `react()` so the generated route imports are rewritten before React's Babel pass touches them.
5. **`routeTree.gen.ts` is generated *and* committed.** First-pass tried gitignoring it; CI typecheck failed because `tsc -b --noEmit` runs before `vite build` and resolves `import { routeTree } from './routeTree.gen.ts'` against a missing file. Cheapest fix: commit the generated file. Diff churn is bounded (only changes when routes are added/removed) and avoids an extra `@tanstack/router-cli` dep for a pre-build codegen step.
6. **Vite proxy → backend `:3000`.** Same-origin from the browser means default `cors()` on the backend and default cookie behavior Just Work; no `credentials: 'include'` on fetch needed. Phase 5 Vercel deploy will route via `vercel.json` rewrites instead.
7. **Type-only backend import seam.** Backend's `exports."./trpc/router".types`-only condition (locked in Phase 2 PR review) means the frontend can only `import type { AppRouter }` — value imports of `appRouter` fail to resolve at the bundler. Defensive seam validates as expected.
8. **TanStack Intent vs `npx skills add` skill loading.** Two complementary mechanisms now coexist. `npx skills add` (Phase 0/2 BetterAuth/Drizzle/etc.) symlinks `SKILL.md` into `.claude/skills/` and content is always loaded. TanStack Intent (Phase 3 onward) ships skills *inside* `node_modules` per package and loads them on-demand via `intent load <pkg>#<skill>`. Spec §4 amended to document both.
9. **Spec promised "TanStack Router/Query/Form/Table skills" via intent.** Reality: only some `@tanstack/*` packages and the two `@trpc/*` client packages publish intent skills today. `@tanstack/react-router`-side skills surface via `@tanstack/router-plugin` and `@tanstack/router-core`; `react-query`, `react-form`, `react-table` don't show as intent-publishers yet. Spec verification line amended.

##### Skills picked up via intent (auto-discovered from node_modules)
- `@trpc/client#client-setup`, `@trpc/client#links`
- `@trpc/tanstack-react-query#react-query-setup`, `@trpc/tanstack-react-query#react-query-classic-migration`
- `@tanstack/router-plugin#…`, `@tanstack/router-core#…` (10 skills)
- `dotenv#dotenv` (carried over from Phase 2 install)

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

#### Phase 4 Completion Report

**Completion Date:** 2026-05-03
**Status:** SUCCESSFUL (local boilerplate complete; full spec status flips to `COMPLETED` after Phase 5 ships the public Vercel URL)
**Branch:** `feature/boilerplate-phase4` → PR'd into `develop`
**Actual Effort:** ~10 minutes (mostly verification, not new code)

##### Summary
Fresh-clone simulation: nuked `node_modules` and `pnpm-lock.yaml`, re-ran `pnpm install && pnpm db:up && pnpm auth:generate && pnpm db:push && pnpm dev`. Full FE↔BE stack came up clean from a wiped state. All workspace gates green; local boilerplate is production-ready.

##### Key Achievements
- **Fresh `pnpm install` from scratch:** 11.2s, no errors. Lockfile picked up four caret-range bumps (`@tanstack/react-query` 5.100.8 → 5.100.9, `baseline-browser-mapping` 2.10.25 → 2.10.27, `rettime` 0.11.8 → 0.11.10, `yocto-spinner` 1.1.0 → 1.2.0). Same line count, same shape — bumps committed.
- **DB reset roundtrip:** `docker compose down -v` → `pnpm db:up` → `auth:generate` → `db:push` recreated all 4 BetterAuth tables (`user`, `session`, `account`, `verification`) on a virgin volume.
- **Parallel `pnpm dev`:** backend on `:3000` and frontend on `:5173` came up under `pnpm -r --parallel`. Browser at `localhost:5173` rendered the typed `health: ok=true ts=…` line. Console clean.
- **All workspace gates green** post-rebuild: `pnpm typecheck` (3/3), `pnpm check` (Biome + ESLint), `pnpm build` (frontend 337 KB JS / 23 KB CSS / 47 KB routes in 334 ms), `pnpm exec biome ci .` (44 files, no fixes).

##### Files Changed
- Modified: `pnpm-lock.yaml` (4 patch/minor bumps from caret-ranged deps).
- Modified: spec — this completion report; Phase 4 Progress Tracker checkbox flipped; status header bumped to "Phase 4 complete".

##### Issues & Decisions
1. **`auth:generate` import order doesn't match Biome's preference.** BetterAuth CLI emits `import { boolean, index, pgTable, text, timestamp }` in the order it walks types; Biome alphabetizes on `pnpm check`. Net effect: `pnpm auth:generate && pnpm check` is idempotent — the second pass just re-alphabetizes. Documented here so future agents don't chase a phantom drift after an `auth:generate` run.
2. **Spec's "Mark spec status → `COMPLETED`" task held back to Phase 5.** §7 Success Criteria require a public Vercel URL serving the same health roundtrip and BetterAuth endpoints. Phase 4 only proves the *local* stack; the spec's overall `COMPLETED` flip is deferred until Phase 5 satisfies the deploy criteria. Status header reads "Phase 4 complete" for now.
3. **Lockfile bumps committed.** Boilerplate lands at the most-current resolved versions so future `pnpm install --frozen-lockfile` reproduces what we just verified, and Phase 5 doesn't have to chase another round of patch bumps.
4. **Untracked local junk left alone.** `.codex/` and `.agents/skills/ramp-bill-pay/` exist in my local working tree (one of my agent tools wrote them, not the boilerplate). Both are out of scope for this PR; not added to `.gitignore` here either, since they're personal-machine artifacts that may not show up on other contributors' machines.

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

#### Phase 5 Completion Report

**Completion Date:** 2026-05-03
**Status:** SUCCESSFUL
**Branch:** `feature/boilerplate-phase5` → PR'd into `develop`
**Actual Effort:** ~2 hours (mostly Vercel/pnpm-workspace plumbing + tsc-on-Vercel debugging)

##### Summary
Boilerplate is live on Vercel + Neon. The same `health` roundtrip and BetterAuth handler that work on `localhost` work on the deployed URL: `/trpc/health` returns the typed `{ ok, ts }` payload, `/api/auth/sign-up/email` returns BetterAuth `VALIDATION_ERROR` JSON (not a 404 or 502). Frontend serves the polished landing card with a live health badge driven by `useQuery(trpc.health.queryOptions())` against the Neon Postgres backend.

##### Key Achievements
- **Single Vercel project** at `arraydude-projects/vamp-bills`, linked to GitHub `arraydude/vamp-bills` — preview deploys on every push, prod deploys promotable via `vercel deploy --prod`.
- **Neon Postgres** auto-provisioned via Vercel's native marketplace integration. 17 env vars (DATABASE_URL pooled, DATABASE_URL_UNPOOLED, POSTGRES_*, NEON_PROJECT_ID, etc.) auto-injected into all environments.
- **BetterAuth schema in Neon** — `user`, `session`, `account`, `verification` tables materialized via `pnpm auth:generate && pnpm db:push` against the pooled URL.
- **Express serverless** — `api/index.ts` re-exports the Express app from `packages/backend`; `vercel.json` rewrites `/trpc/(.*)` and `/api/auth/(.*)` → `/api/index`. Cold start ~500ms, warm < 100ms.
- **All four success criteria met** for the deployment: public URL renders the typed health payload; `/api/auth/sign-up/email` returns BetterAuth JSON; build cache + function bundle clean; spec status flips to `COMPLETED`.

##### Files Changed
- New: `vercel.json`, `api/{package.json, tsconfig.json, index.ts}`, `.vercelignore`, `packages/backend/src/app.ts` (createApp factory)
- Modified: `packages/backend/{package.json (exports./app), src/index.ts (split into createApp + listen)}`, root `package.json` (`@types/node` hoisted), `pnpm-workspace.yaml` (api/ added), `.gitignore` (.vercel)
- Frontend: polished `routes/index.tsx` — hero + Stack table + live health badge + GitHub link, replacing the dev-scaffold "Phase 3" copy
- Skills: `deploy-to-vercel`, `vercel-cli`, `env-vars` symlinked + locked

##### Issues & Decisions
1. **Backend `app.ts` / `index.ts` split.** Local dev needs `app.listen()`; Vercel serverless needs the bare app exported. Refactored `packages/backend/src/index.ts` to import `createApp()` from new `src/app.ts`; api/index.ts re-exports `createApp()` as the default handler. Same wiring on both paths, no duplication.
2. **Single-project hybrid deploy is intentional, not canonical.** Vercel's current Node-backend guidance prefers making the framework app the deployed project directly — no `api/` wrapper, no rewrites, no backend transpilation script. We knowingly deviate for this take-home because the repo is a hybrid Vite SPA + Express/tRPC backend and one same-origin Vercel project is simpler to demo than either two Vercel projects or one Express app serving the built SPA. If the demo grows into a production app, revisit this decision first.
3. **`runtime` field rejected.** First `vercel.json` had `"runtime": "@vercel/node@5"` — package-version syntax, not Vercel runtime identifier. Vercel auto-detects Node from `.ts`; dropped the field, kept only `includeFiles: "packages/backend/**"`.
4. **`api/` as a workspace package.** `api/index.ts` value-imports `../packages/backend/src/app.ts` (relative path, not workspace alias — Vercel's tsc didn't have the alias on its resolution path). Added `api/` to `pnpm-workspace.yaml` so it gets `@types/express` + `@types/node` via its own package.json. Created `api/package.json` with `"type": "module"` to satisfy `verbatimModuleSyntax`.
5. **`@types/node` hoisted to root** to fix Vercel tsc's `req.headers does not exist` warning. The error wasn't fatal (function bundled fine), but resolution was failing because Vercel's tsc didn't pick up `@types/node` from `api/`'s declared devDeps. Hoisting puts it on every package's resolution path.
6. **Vercel CLI's `env add` quirks** in non-interactive mode:
   - `--value <X> --yes` works for production/development, **requires explicit branch** for preview (`vercel env add NAME preview <branch> --value <X> --yes`).
   - `vercel env rm NAME preview <branch>` syntax differs from add — interprets the branch as a "Custom Environment" name and errors if not found.
   - Set `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` for: production, development, preview/develop, preview/feature-boilerplate-phase5. Workaround documented for follow-up branches.
7. **BETTER_AUTH_URL = `https://vamp-bills.vercel.app`** — the canonical prod alias. Preview URLs (`vamp-bills-<hash>-arraydude-projects.vercel.app`) don't match, but BetterAuth still mounts and the validation/CSRF paths work for a demo. Production deploy will land on the matching URL; preview cookies/OAuth callbacks would need `trustedOrigins` if we shipped Google login on previews.
8. **Deployment Protection ON by default** for hobby team projects. Preview URLs return 401 to anonymous browsers. `vercel curl` auto-fetches a project bypass token; for the public demo URL, either disable Protection in dashboard or rely on the production alias (which has separate visibility settings).
9. **`vercel link --scope <personal>` rejected.** Vercel CLI errors "You cannot set your Personal Account as the scope" when the GH repo lives in a team. Linked under team scope (`arraydude-projects`) instead — actually correct since the repo's at `arraydude/vamp-bills`.
10. **Username display name updated mid-flow.** User changed Vercel display from `emiliano-9902` to `arraydude-vercel` to align with the GH org. No code change required; project link stayed valid.
11. **Two `auth-schema.ts` re-format passes** during the deploy iteration — same idempotent BetterAuth-CLI-vs-Biome import-order drift documented in Phase 4 Decision #1. Net-zero diff after each pass.

##### Smoke evidence (live URLs)
| Endpoint | Result |
|---|---|
| `https://vamp-bills-83znnh6dl-arraydude-projects.vercel.app/` | Page renders with header + hero + Stack + footer; `backend healthy · ts=…` populates from typed tRPC roundtrip |
| `…/trpc/health` | `{"result":{"data":{"ok":true,"ts":<num>}}}` |
| `…/api/auth/sign-up/email` (POST) | `{"code":"VALIDATION_ERROR","message":"[body.name] Invalid input: expected string, received undefined; [body.email] Invalid email address"}` |

(Preview URLs change per commit; the canonical production alias is `vamp-bills.vercel.app` once `vercel deploy --prod` is run.)

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

All of the following are now true (boilerplate is COMPLETED 2026-05-03):

- [x] `pnpm-workspace.yaml` lists `packages/*` plus the standalone `api/` workspace (4 packages discovered: `@workspace/ui`, `@vamp-bills/frontend`, `@vamp-bills/backend`, `@vamp-bills/api`). The original spec called for 3 packages; the `api/` workspace was added in Phase 5 as the Vercel serverless wrapper for the Express backend (Phase 5 Completion Report Decision #3).
- [x] `pnpm install && pnpm db:up && pnpm auth:generate && pnpm db:push && pnpm dev` succeeds from a clean clone — verified in Phase 4's fresh-clone simulation.
- [x] `http://localhost:5173/` renders a shadcn-themed page that shows `{ ok: true, ts: <number> }` from a typed `useQuery(trpc.health.queryOptions())` call (the v11 `@trpc/tanstack-react-query` pattern; the original spec's `trpc.health.useQuery()` shape predates the v11 client — see Phase 3 Completion Report Decision #1).
- [x] `curl -X POST http://localhost:3000/api/auth/sign-up/email -H 'content-type: application/json' -d '{}'` returns a JSON error from BetterAuth (proves it's mounted and live), not a 404.
- [x] `pnpm build` compiles all packages with `tsc` clean.
- [x] `pnpm check` (Biome + ESLint per package) exits 0.
- [x] No legacy ESLint, Prettier, or related dependencies remain in any `package.json` (ESLint 10 stays as the type-aware lint layer alongside Biome — see Phase 1 Decision #9; Prettier was fully removed in Phase 1).
- [x] Spec file at `.claude/specs/BOILERPLATE_SCAFFOLDING_SPEC.md` has Status `COMPLETED` with phase completion reports for Phases 0–5.
- [x] `.claude/skills/` contains the installed skills via the two loading models documented in [§4](#4-agent-skills): the cross-cutting skills via `npx skills add` (Phase 0/2 BetterAuth, Drizzle, tRPC type-safety, Vercel CLI / env-vars / deploy-to-vercel, etc.) **and** the on-demand skills auto-discovered from `node_modules` via TanStack Intent (Phase 3+ — `@trpc/client`, `@trpc/tanstack-react-query`, `@tanstack/router-*`). Spec §4 amended in Phase 3 to document both models.
- [x] **Public Vercel URL** serves the same shadcn-themed page with the typed `useQuery(trpc.health.queryOptions())` roundtrip against the Neon Postgres backend (live as of Phase 5 — preview deploys at `https://vamp-bills-<hash>-arraydude-projects.vercel.app/`; production alias `vamp-bills.vercel.app` lights up on the next `develop → main` release).
- [x] **Public auth endpoints** respond on the deployed URL: `/api/auth/sign-up/email` returns BetterAuth `VALIDATION_ERROR` JSON. The Google OAuth flow at `/api/auth/sign-in/social/google` is wired in `auth.ts` but only enabled when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set on Vercel — out of scope for the demo (per Phase 5 Completion Report Decision #6).

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

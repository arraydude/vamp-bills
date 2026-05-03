# vamp-bills

A Bill Pay-style accounts payable demo, modeled on Ramp Bill Pay.

**Live demo:** https://vamp-bills.vercel.app — landing page renders a typed `useQuery(trpc.health.queryOptions())` roundtrip through Vercel serverless → Neon Postgres. The `health: ok=true ts=…` line proves the FE↔BE seam is live in production. Press <kbd>d</kbd> to toggle dark mode.

- Scope and lifecycle: [`docs/mvp-scope.md`](./docs/mvp-scope.md)
- Branching workflow: [`docs/contributing.md`](./docs/contributing.md)
- Boilerplate spec (archived, completed 2026-05-03): [`.claude/specs/archive/BOILERPLATE_SCAFFOLDING_SPEC_COMPLETED_2026-05-03.md`](./.claude/specs/archive/BOILERPLATE_SCAFFOLDING_SPEC_COMPLETED_2026-05-03.md)

## Database

Application tables live in [`packages/backend/src/db/app-schema.ts`](./packages/backend/src/db/app-schema.ts) (`vendors`, `bills`, `bill_line_items`, `payments`) alongside the BetterAuth-generated tables in `auth-schema.ts`. Field-level definitions, status enums, and the bill/payment lifecycle are documented in [`docs/mvp-scope.md`](./docs/mvp-scope.md).

Schema changes follow a three-command workflow:

- `pnpm db:generate` — diff schema files and emit a new SQL migration into [`packages/backend/drizzle/`](./packages/backend/drizzle/). Pass `--name <descriptive_name>` so the file lands as `NNNN_<descriptive_name>.sql` instead of an auto-generated slug.
- `pnpm db:migrate` — apply checked-in migrations against `DATABASE_URL` using the `drizzle.__drizzle_migrations` ledger to skip already-applied entries. Use this for Neon (and any environment you need a migration history for).
- `pnpm db:push` — direct schema → DB sync that bypasses the migration files entirely. Local-dev convenience only; never run against Neon (it would create silent drift between the DB and the ledger).

## Stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces (no Turbo — `pnpm -r --parallel` is enough) |
| Frontend | Vite 8 + React 19 + React Compiler, TanStack Router/Query/Form/Table, tRPC client |
| Backend | Express 5 + tRPC 11 + Drizzle + BetterAuth |
| Design system | shadcn/ui (Base UI, Tailwind v4) — `@workspace/ui` |
| Database | Postgres (Docker locally, Neon in prod) |
| Tooling | Biome 2 (format + lint), ESLint 10, TypeScript 6 |
| Hosting | Vercel (frontend + Express serverless) + Neon Postgres |

## Structure

```
packages/
  design-system/   shadcn primitives — package name @workspace/ui
  frontend/        Vite + React app — @vamp-bills/frontend
  backend/         Express + tRPC server — @vamp-bills/backend
```

## Getting started

```bash
pnpm install
cp .env.example .env       # fill in BETTER_AUTH_SECRET (openssl rand -base64 32), GOOGLE_CLIENT_*
pnpm db:up                 # start postgres on :5432
pnpm auth:generate         # generate BetterAuth Drizzle schema (first run only)
pnpm db:migrate            # apply checked-in migrations to local pg
pnpm dev                   # boot all packages in parallel (`pnpm -r --parallel`)
```

Frontend on `:5173` proxies `/trpc` and `/api/auth` to the backend on `:3000` (configured in `packages/frontend/vite.config.ts`).

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Boot all packages in parallel (`pnpm -r --parallel dev`) |
| `pnpm build` | Production build across packages |
| `pnpm typecheck` | `tsc --noEmit` across packages |
| `pnpm check` | Biome format + lint with auto-fix + ESLint per package |
| `pnpm format` | Biome format only |
| `pnpm lint` | Biome lint only |
| `pnpm db:up` / `db:down` | docker-compose postgres |
| `pnpm db:generate` | Drizzle Kit — generate SQL migrations from schema (use `--name <descriptive>`) |
| `pnpm db:migrate` | Drizzle Kit — apply checked-in migrations to the connected DB (use this for Neon) |
| `pnpm db:push` | Drizzle Kit — direct schema → DB sync; **local dev only**, bypasses the migration ledger |
| `pnpm auth:generate` | BetterAuth CLI — regenerate `packages/backend/src/db/auth-schema.ts` from `auth.ts` |

# vamp-bills

A Bill Pay-style accounts payable demo, modeled on Ramp Bill Pay.

**Live demo:** https://vamp-bills.vercel.app — landing page renders a typed `useQuery(trpc.health.queryOptions())` roundtrip through Vercel serverless → Neon Postgres. The `health: ok=true ts=…` line proves the FE↔BE seam is live in production. Press <kbd>d</kbd> to toggle dark mode.

- Scope and lifecycle: [`docs/mvp-scope.md`](./docs/mvp-scope.md)
- Branching workflow: [`docs/contributing.md`](./docs/contributing.md)
- Boilerplate spec (archived, completed 2026-05-03): [`.claude/specs/archive/BOILERPLATE_SCAFFOLDING_SPEC_COMPLETED_2026-05-03.md`](./.claude/specs/archive/BOILERPLATE_SCAFFOLDING_SPEC_COMPLETED_2026-05-03.md)

## Database

Application tables live in [`packages/backend/src/db/app-schema.ts`](./packages/backend/src/db/app-schema.ts) (`vendors`, `bills`, `bill_line_items`, `payments`) alongside the BetterAuth-generated tables in `auth-schema.ts`. Field-level definitions, status enums, and the bill/payment lifecycle are documented in [`docs/mvp-scope.md`](./docs/mvp-scope.md).

**Schema sync — `db:push`, not migrations (demo phase).** During the MVP/demo phase the Drizzle schema files are the single source of truth and `pnpm db:push` syncs them to both local Postgres and Neon. We deliberately don't use the `drizzle-kit migrate` flow yet — there's no production data to protect, no team coordination problem to solve, and no rollback story we'd ever exercise. Before productionizing this app for real, switch to `drizzle-kit migrate` plus a baseline strategy on Neon (see [Drizzle migration docs](https://orm.drizzle.team/docs/migrations)).

The two commands actually used:

- `pnpm db:generate` — emit SQL into [`packages/backend/drizzle/`](./packages/backend/drizzle/) for **review purposes only**. Run after a schema change so the PR diff includes the actual DDL reviewers can read. Pass `--name <descriptive_name>` so files land as `NNNN_<descriptive_name>.sql`. See [`packages/backend/drizzle/README.md`](./packages/backend/drizzle/README.md) for the "reference, not applied" caveat.
- `pnpm db:push` — direct schema → DB sync against `DATABASE_URL`. Used for local dev. Neon syncs **automatically** on every push to `main` via [`.github/workflows/db-push.yml`](./.github/workflows/db-push.yml) — no manual step needed for non-destructive changes; see [`packages/backend/drizzle/README.md`](./packages/backend/drizzle/README.md) for the destructive-change escape hatch.

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

### `@workspace/ui` components

shadcn `base-luma` style on Base UI. Frontend imports primitives via
`@workspace/ui/components/<name>`; both `components.json` files are wired so
new components added in `packages/design-system/` are immediately available.

Currently installed:

- **Blocks:** `sidebar-08` (collapsible app shell + user menu), `login-01`
  (email/password sign-in card)
- **Primitives:** avatar, badge, breadcrumb, button (custom Base UI build —
  do not overwrite), calendar, card, checkbox, collapsible, dialog,
  dropdown-menu, field, input, label, popover, select, separator, sheet,
  sidebar, skeleton, sonner, table, tabs, tooltip
- **Hooks:** `use-mobile`

To add more, run from `packages/design-system/`:

```bash
pnpm dlx shadcn@latest add <component-or-block>
```

Vendored shadcn files live under `src/components/**` and `src/hooks/use-mobile.ts`;
those paths get relaxed Biome + ESLint rules so re-running the CLI doesn't
churn lint config (see `biome.json` overrides + `packages/design-system/eslint.config.mjs`).

## Getting started

```bash
pnpm install
cp .env.example .env       # fill in BETTER_AUTH_SECRET (openssl rand -base64 32), GOOGLE_CLIENT_*
pnpm db:up                 # start postgres on :5432
pnpm auth:generate         # generate BetterAuth Drizzle schema (first run only)
pnpm db:push               # sync schema to local pg
pnpm dev                   # boot all packages in parallel (`pnpm -r --parallel`)
```

Frontend on `:5173` proxies `/trpc` and `/api/auth` to the backend on `:3000` (configured in `packages/frontend/vite.config.ts`).

> **`INVALID_ORIGIN` on sign-in/sign-out?** Vite's proxy rewrites the `Origin` header, so Better Auth rejects it. Add the frontend and backend origins to `trustedOrigins` in `packages/backend/src/auth.ts` (e.g. `["http://localhost:3000", "http://localhost:5173"]`). If Vite picks a different port, add that too.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Boot all packages in parallel (`pnpm -r --parallel dev`) |
| `pnpm build` | Production build across packages |
| `pnpm typecheck` | `tsc --noEmit` across packages |
| `pnpm test` | Run vitest across packages (unit tests for pure-function modules; integration tests not yet added) |
| `pnpm check` | Biome format + lint with auto-fix + ESLint per package |
| `pnpm format` | Biome format only |
| `pnpm lint` | Biome lint only |
| `pnpm db:up` / `db:down` | docker-compose postgres |
| `pnpm db:generate` | Drizzle Kit — emit SQL into `drizzle/` for PR review (use `--name <descriptive>`); **not applied to any DB during demo phase** |
| `pnpm db:push` | Drizzle Kit — direct schema → DB sync against `DATABASE_URL`; canonical sync command for both local and Neon during demo phase |
| `pnpm auth:generate` | BetterAuth CLI — regenerate `packages/backend/src/db/auth-schema.ts` from `auth.ts` |

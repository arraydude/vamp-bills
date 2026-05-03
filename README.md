# vamp-bills

A Bill Pay-style accounts payable demo, modeled on Ramp Bill Pay.

**Live demo:** https://vamp-bills.vercel.app — landing page renders a typed `useQuery(trpc.health.queryOptions())` roundtrip through Vercel serverless → Neon Postgres. The `health: ok=true ts=…` line proves the FE↔BE seam is live in production. Press <kbd>d</kbd> to toggle dark mode.

- Scope and lifecycle: [`docs/mvp-scope.md`](./docs/mvp-scope.md)
- Branching workflow: [`docs/contributing.md`](./docs/contributing.md)
- Boilerplate spec (archived, completed 2026-05-03): [`.claude/specs/archive/BOILERPLATE_SCAFFOLDING_SPEC_COMPLETED_2026-05-03.md`](./.claude/specs/archive/BOILERPLATE_SCAFFOLDING_SPEC_COMPLETED_2026-05-03.md)

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
pnpm db:push               # apply schema to local pg
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
| `pnpm db:generate` | Drizzle Kit — generate SQL migrations from schema |
| `pnpm db:push` | Drizzle Kit — apply schema directly to the connected DB |
| `pnpm auth:generate` | BetterAuth CLI — regenerate `packages/backend/src/db/auth-schema.ts` from `auth.ts` |

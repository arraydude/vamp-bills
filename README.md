# vamp-bills

A Bill Pay-style accounts payable demo, modeled on Ramp Bill Pay.

- Scope and lifecycle: [`docs/mvp-scope.md`](./docs/mvp-scope.md)
- Branching workflow: [`docs/contributing.md`](./docs/contributing.md)
- Boilerplate spec & progress: [`.claude/specs/BOILERPLATE_SCAFFOLDING_SPEC.md`](./.claude/specs/BOILERPLATE_SCAFFOLDING_SPEC.md)

## Stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces (no Turbo — `pnpm -r --parallel` is enough) |
| Frontend | Vite + React 19, TanStack Router/Query/Form/Table |
| Backend | Express + tRPC + Drizzle + BetterAuth *(Phase 2)* |
| Design system | shadcn/ui (Base UI, Tailwind v4) — `@workspace/ui` |
| Database | Postgres (Docker locally, Neon in prod) |
| Tooling | Biome 2 (format + lint), TypeScript |
| Hosting | Vercel (frontend + Express serverless) + Neon Postgres *(Phase 5)* |

## Structure

```
packages/
  design-system/   shadcn primitives — package name @workspace/ui
  frontend/        Vite + React app — @vamp-bills/frontend
  backend/         Express + tRPC server — @vamp-bills/backend (Phase 2)
```

## Getting started

```bash
pnpm install
cp .env.example .env       # fill in BETTER_AUTH_SECRET, GOOGLE_CLIENT_*
pnpm db:up                 # start postgres on :5432
pnpm dev                   # boot all packages in parallel (`pnpm -r --parallel`)
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Boot all packages in parallel (`pnpm -r --parallel dev`) |
| `pnpm build` | Production build across packages |
| `pnpm typecheck` | `tsc --noEmit` across packages |
| `pnpm check` | Biome format + lint with auto-fix |
| `pnpm format` | Biome format only |
| `pnpm lint` | Biome lint only |
| `pnpm db:up` / `db:down` | docker-compose postgres |

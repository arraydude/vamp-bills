# Local setup

## Prerequisites

- **Node.js** >=20.19
- **pnpm** >=10
- **Docker** (for local Postgres)

## 1. Install dependencies

```bash
pnpm install
```

This also wires the pre-commit hook (`biome check --staged --write`).

## 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in the required values:

| Variable | How to get it |
|---|---|
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `http://localhost:5173` (already set in `.env.example`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — set redirect URI to `http://localhost:5173/api/auth/callback/google` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — free, optional (AI invoice scanning won't work without it) |
| `DATABASE_URL` | Default `postgresql://vamp:vamp@localhost:5432/vamp` works with the Docker setup below |

## 3. Start Postgres

```bash
pnpm db:up
```

This runs `docker compose up -d postgres` — Postgres 16 on port 5432.

## 4. Generate auth schema & push DB

```bash
pnpm auth:generate   # generates BetterAuth's Drizzle schema (first run only)
pnpm db:push         # syncs all Drizzle schemas to local Postgres
```

## 5. Start dev servers

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

Vite proxies `/trpc` and `/api/auth` to the backend, so everything works through `:5173`.

## Troubleshooting

**`INVALID_ORIGIN` on sign-in/sign-out?** Vite's proxy rewrites the `Origin` header. Add both origins to `trustedOrigins` in `packages/backend/src/auth.ts`:

```ts
trustedOrigins: ["http://localhost:3000", "http://localhost:5173"]
```

If Vite picks a different port, add that too.

**Port 5432 already in use?** Stop any existing Postgres: `docker compose down` or check `lsof -i :5432`.

## Scripts reference

| Command | What it does |
|---|---|
| `pnpm dev` | Boot all packages in parallel |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` across packages |
| `pnpm test` | Run vitest |
| `pnpm check` | Biome format + lint + ESLint |
| `pnpm db:up` / `db:down` | Start / stop Docker Postgres |
| `pnpm db:push` | Sync Drizzle schema to DB |
| `pnpm db:generate --name <x>` | Emit SQL for PR review (not applied) |
| `pnpm auth:generate` | Regenerate BetterAuth schema |

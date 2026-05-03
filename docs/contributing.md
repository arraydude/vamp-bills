# Contributing

## Branches

| Branch | Purpose | Protected | Deploys to |
|---|---|---|---|
| `main` | Production. Tagged releases land here. | ✅ PRs only, no direct pushes | Vercel **production** |
| `develop` | Integration / staging. Default branch. | — | Vercel **preview** (one URL per push) |
| `feature/<topic>` | Work branches off `develop`. | — | Vercel **preview** (one URL per PR) |

## Flow

### Feature → develop

1. `git checkout develop && git pull`
2. `git checkout -b feature/<topic> develop`
3. Code, commit, push.
4. Open PR → **`develop`**. **Squash & merge** when CI is green.

### Release: develop → main

When `develop` has a coherent set of changes ready to ship:

1. Open PR → **`main`** from `develop`.
2. **Merge commit** (preserves the per-feature squash commits in main's history).
3. Vercel auto-deploys the resulting `main` to production.

### Hotfix (when prod is broken and develop isn't ready)

1. `git checkout -b hotfix/<issue> main`
2. Fix, push, PR → **`main`**. **Merge commit**.
3. Cherry-pick back to develop: `git checkout develop && git cherry-pick -x <sha>`
4. Push develop.

## Rules of thumb

- **Squash for develop** (keeps `develop` linear, one commit per feature).
- **Merge-commit for main** (preserves feature boundaries in production history).
- **Never `git push --force`** on `main` or `develop`.
- **Never "Rebase & merge"** — rewrites SHAs and breaks cherry-pick traceability.

## Local setup

See [`/.env.example`](../.env.example) for required env vars and [`/docker-compose.yml`](../docker-compose.yml) for the local Postgres. Boot the world with:

```bash
pnpm install
pnpm db:up
pnpm dev
```

`pnpm install` runs the `prepare` script, which wires the
`simple-git-hooks` pre-commit hook. The hook runs
`biome check --staged --write` over staged files and re-stages any
fixes so commits don't fail CI on formatting / import-sort issues.
To bypass it for an emergency commit, set `SKIP_SIMPLE_GIT_HOOKS=1`.

## Commit messages

Conventional Commits style — `feat(scope):`, `fix(scope):`, `docs(scope):`, etc. Scope is the package name when relevant (e.g. `feat(frontend): wire trpc client`).

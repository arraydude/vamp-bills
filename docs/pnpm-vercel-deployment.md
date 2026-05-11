# pnpm + Vercel: Deployment Issues and Solutions

## The Problem

Vercel's serverless function bundler uses [NFT (Node File Tracer)](https://github.com/vercel/nft) to trace `import`/`require` calls and determine which files to include in the function bundle. NFT follows the filesystem to resolve modules.

pnpm uses a **content-addressable store** at `node_modules/.pnpm/` with **symlinks** to deduplicate packages. A typical resolution chain looks like:

```
packages/backend/node_modules/@trpc/server
  → symlink → ../../node_modules/.pnpm/@trpc+server@11.17.0/node_modules/@trpc/server/
    → that directory contains its own node_modules/ with MORE symlinks to other .pnpm entries
```

NFT **cannot follow these symlink chains** reliably. When it encounters a symlink pointing to a `.pnpm/` entry, it may not include the target files in the bundle. At runtime, the serverless function crashes with `ERR_MODULE_NOT_FOUND`.

## Why It Gets Worse with Deep Dependency Trees

Simple packages (express, cors, pg) have shallow dep trees that NFT sometimes traces correctly. The AI SDK (`ai` + `@ai-sdk/google`) has a deep transitive tree:

```
ai → @ai-sdk/gateway → @vercel/oidc
   → @ai-sdk/provider-utils → eventsource-parser
                             → @standard-schema/spec
                             → @ai-sdk/provider → json-schema
```

Each of these lives in its own `.pnpm/` entry behind symlinks. Including them all in the `includeFiles` glob hits Vercel's **256-character limit** for that field.

## What We Tried (and Why Each Failed)

| Approach | Result |
|---|---|
| Enumerate all transitive deps in `includeFiles` glob | Exceeds 256-char limit |
| Wildcard glob `node_modules/.pnpm/*/node_modules/**` | Exceeds 250MB unzipped function limit |
| `public-hoist-pattern[]=*` in `.npmrc` | Packages hoisted but still behind symlinks — same NFT issue |
| `shamefully-hoist=true` in install command | Still uses `.pnpm/` store with symlinks internally |
| `node-linker=hoisted` in install command | Creates flat layout but causes duplicate `@types/react` — `tsc -b` fails |

## Current Workaround

Three pieces working together:

1. **`.npmrc`**: `public-hoist-pattern[]=@types/*` — deduplicates `@types/react` so `tsc -b` passes on Vercel.

2. **`vercel.ts` `includeFiles`**: enumerates direct backend deps with scope collapsing (`@ai-sdk+*@*` instead of listing each `@ai-sdk/*` package). Covers the first level of symlinks.

3. **Dynamic import for AI extraction**: `await import("@vamp-bills/backend/ai/extract-invoice.ts")` — keeps the AI SDK out of the startup import graph. If AI deps aren't fully bundled, only the extraction endpoint fails; auth, tRPC, and bills CRUD all work.

## Recommended Long-Term Fixes

### Option A: Bundle the serverless function (recommended)

Use esbuild to bundle `api/index.ts` into a single file with all dependencies inlined. This completely eliminates the pnpm symlink problem — NFT doesn't need to trace anything because everything is in one file.

```bash
# Example build step
esbuild api/index.ts --bundle --platform=node --format=esm --outfile=api/index.mjs \
  --external:pg-native --packages=bundle
```

Add this as a pre-build step in `vercel.ts`:

```ts
buildCommand: "node scripts/bundle-api.mjs && pnpm --filter @vamp-bills/frontend build",
```

Pros: permanent fix, no `includeFiles` needed, no 256-char limit, no glob maintenance.
Cons: requires handling Node.js built-in externals and native modules (`pg-native`).

### Option B: Separate deployments

Split the monorepo into two Vercel projects:

- **Frontend project**: static site deployment (Vite build output), no serverless functions.
- **Backend project**: Express server deployed as a standalone serverless function with its own `package.json` and install step.

The frontend would call the backend via its Vercel URL (configured as an env var), eliminating the cross-workspace import tracing that causes the issue.

Pros: clean separation, each project has its own simple `node_modules`.
Cons: two Vercel projects to manage, CORS configuration, separate deploy pipelines, loss of the Vite proxy convenience.

### Option C: Switch to npm for CI/Vercel

Use pnpm locally for development (fast, strict) but npm on Vercel:

```ts
installCommand: "npm install",
```

npm creates a flat `node_modules` with real files — exactly what NFT was designed for. The `pnpm-lock.yaml` can be converted with `pnpm import` or by committing a `package-lock.json` alongside it.

Pros: zero NFT issues, zero symlink issues.
Cons: two lockfiles to maintain, npm's slower and less strict resolution.

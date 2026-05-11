// Vercel project config — derives the function `includeFiles` glob from
// `packages/backend/package.json#dependencies` so adding a new backend
// runtime dep doesn't require a separate config edit.
//
// Background: the routers PR's import graph tripped Vercel's NFT trace
// against pnpm's symlinked `.pnpm` store, dropping `@trpc/server/dist/
// index.mjs` from the bundle and crashing the function on cold start.
// Codex unblocked it by hand-listing every runtime dep in the glob; this
// file produces the same shape automatically.
import { readFileSync } from "node:fs";

import type { VercelConfig } from "@vercel/config/v1";

const backendDeps = Object.keys(
  (
    JSON.parse(readFileSync("packages/backend/package.json", "utf8")) as {
      dependencies: Record<string, string>;
    }
  ).dependencies,
);

// pnpm encodes scoped names with `+` (e.g. `@trpc/server` → `@trpc+server`)
// and suffixes the .pnpm dir with `@<version>[_<peer-resolutions>]`. The
// `@*` anchor is load-bearing: `pg*` would also match `pg-pool`,
// `pg-connection-string`, etc. — `pg@*` only matches `pg@<version>...`.
//
// Scoped packages with the same org (e.g. @ai-sdk/google, @ai-sdk/provider)
// are collapsed into a single `@scope+*@*` wildcard to stay under Vercel's
// 256-char includeFiles limit.
const scopeGroups = new Map<string, boolean>();
const entries: string[] = [];
for (const dep of backendDeps) {
  if (dep.startsWith("@")) {
    const scope = dep.split("/")[0]!;
    if (!scopeGroups.has(scope)) {
      scopeGroups.set(scope, true);
      entries.push(`${scope}+*@*`);
    }
  } else {
    entries.push(`${dep}@*`);
  }
}
const pnpmEntries = entries.join(",");

export const config: VercelConfig = {
  installCommand: "pnpm install --frozen-lockfile",
  buildCommand: "pnpm --filter @vamp-bills/frontend build",
  outputDirectory: "packages/frontend/dist",
  rewrites: [
    { source: "/trpc/(.*)", destination: "/api/index" },
    { source: "/api/auth/(.*)", destination: "/api/index" },
    { source: "/((?!trpc|api).*)", destination: "/index.html" },
  ],
  functions: {
    "api/index.ts": {
      includeFiles: [
        "packages/backend/{src,drizzle,node_modules}/**",
        `node_modules/.pnpm/{${pnpmEntries}}/node_modules/**`,
      ],
    },
  },
};

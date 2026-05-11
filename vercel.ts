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
// and suffixes the .pnpm dir with `@<version>[_<peer-resolutions>]`.
// Scoped packages sharing an org are collapsed into `@scope+*` wildcards
// to stay under Vercel's 256-char includeFiles limit. The `}*/` glob
// (instead of `}@*/`) matches the version suffix without the extra chars.
const seen = new Set<string>();
const entries: string[] = [];
for (const dep of backendDeps) {
  if (dep.startsWith("@")) {
    const scope = dep.split("/")[0];
    if (scope && !seen.has(scope)) {
      seen.add(scope);
      entries.push(`${scope}+*`);
    }
  } else {
    entries.push(dep);
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
      includeFiles: `{packages/backend/{src,drizzle,node_modules}/**,node_modules/.pnpm/{${pnpmEntries}}*/node_modules/**}`,
    },
  },
};

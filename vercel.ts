import { readFileSync } from "node:fs";

import type { VercelConfig } from "@vercel/config/v1";

const backendDeps = Object.keys(
  (
    JSON.parse(readFileSync("packages/backend/package.json", "utf8")) as {
      dependencies: Record<string, string>;
    }
  ).dependencies,
);

// Scoped packages sharing an org collapse into `@scope+*@*` wildcards
// to stay under Vercel's 256-char includeFiles limit.
const seen = new Set<string>();
const entries: string[] = [];
for (const dep of backendDeps) {
  if (dep.startsWith("@")) {
    const scope = dep.split("/")[0];
    if (scope && !seen.has(scope)) {
      seen.add(scope);
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
      includeFiles: `{packages/backend/{src,drizzle,node_modules}/**,node_modules/.pnpm/{${pnpmEntries}}/node_modules/**}`,
    },
  },
};

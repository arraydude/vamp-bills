import type { VercelConfig } from "@vercel/config/v1";

// NFT traces most deps through pnpm symlinks fine. These are the ones
// it can't resolve — scoped packages and their transitive trees. Direct
// unscoped deps (express, cors, pg, zod, etc.) are traced automatically.
// When a new scoped dep is added and Vercel fails with ERR_MODULE_NOT_FOUND,
// add its scope here.
const pnpmGlob = [
  "@ai-sdk+*",
  "@opentelemetry+*",
  "@standard-schema+*",
  "@trpc+*",
  "@vercel+*",
  "ai",
  "better-auth",
  "drizzle-orm",
  "drizzle-zod",
  "eventsource-parser",
  "json-schema",
  "xstate",
].join(",");

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
      includeFiles: `{packages/backend/{src,drizzle,node_modules}/**,node_modules/.pnpm/{${pnpmGlob}}*/node_modules/**}`,
    },
  },
};

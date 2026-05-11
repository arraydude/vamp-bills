import type { VercelConfig } from "@vercel/config/v1";

// pnpm always uses symlinks — even with shamefully-hoist, actual files
// live in .pnpm/ behind symlink chains that Vercel can't follow.
// node-linker=hoisted creates real flat files with no symlinks at all.
// Only set on Vercel — local dev keeps default pnpm strict isolation.
export const config: VercelConfig = {
  installCommand: "echo node-linker=hoisted > .npmrc && pnpm install",
  buildCommand: "pnpm --filter @vamp-bills/frontend build",
  outputDirectory: "packages/frontend/dist",
  rewrites: [
    { source: "/trpc/(.*)", destination: "/api/index" },
    { source: "/api/auth/(.*)", destination: "/api/index" },
    { source: "/((?!trpc|api).*)", destination: "/index.html" },
  ],
  functions: {
    "api/index.ts": {
      includeFiles: "packages/backend/{src,drizzle}/**",
    },
  },
};

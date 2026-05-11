import type { VercelConfig } from "@vercel/config/v1";

// pnpm's strict isolation + symlinked .pnpm store breaks Vercel's NFT
// tracer for transitive deps. Using shamefully-hoist on Vercel only
// creates a flat node_modules that NFT can trace. Local dev keeps strict
// pnpm (the .npmrc stays empty).
export const config: VercelConfig = {
  installCommand: "echo shamefully-hoist=true > .npmrc && pnpm install",
  buildCommand: "pnpm --filter @vamp-bills/frontend build",
  outputDirectory: "packages/frontend/dist",
  rewrites: [
    { source: "/trpc/(.*)", destination: "/api/index" },
    { source: "/api/auth/(.*)", destination: "/api/index" },
    { source: "/((?!trpc|api).*)", destination: "/index.html" },
  ],
};

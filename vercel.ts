import type { VercelConfig } from "@vercel/config/v1";

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
      includeFiles: "packages/backend/{src,drizzle,node_modules}/**",
    },
  },
};

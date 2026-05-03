import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";

// Same-origin URL — Vite proxy forwards /trpc → http://localhost:3000 in dev;
// Phase 5 will rewrite via vercel.json in prod.
export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/trpc" })],
});

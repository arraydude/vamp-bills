import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/trpc" })],
});

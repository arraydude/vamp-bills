import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";

// React-side tRPC bindings: TRPCProvider mounts the client + queryClient,
// useTRPC()/useTRPCClient() are the hooks consumers reach for.
// AppRouter import is type-only (backend exposes only the `types` condition
// in its package exports), so no runtime backend code is bundled here.
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

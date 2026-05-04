import { billsRouter } from "@vamp-bills/backend/trpc/routers/bills/routes.ts";
import { paymentsRouter } from "@vamp-bills/backend/trpc/routers/payments/routes.ts";
import { vendorsRouter } from "@vamp-bills/backend/trpc/routers/vendors/routes.ts";
import { publicProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
  vendors: vendorsRouter,
  bills: billsRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;

import { billsRouter } from "@vamp-bills/backend/trpc/routers/bills.ts";
import { paymentsRouter } from "@vamp-bills/backend/trpc/routers/payments.ts";
import { vendorsRouter } from "@vamp-bills/backend/trpc/routers/vendors.ts";
import { publicProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
  vendors: vendorsRouter,
  bills: billsRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;

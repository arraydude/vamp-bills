import { payments } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

// Read-only for now. Mutations on payments happen as side effects of
// `bills.markPaid` / `bills.cancelPayment` — there's no standalone
// payment-create or payment-edit affordance in the MVP.
export const paymentsRouter = router({
  listForBill: protectedProcedure
    .input(z.object({ billId: z.string().min(1) }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(payments)
        .where(eq(payments.billId, input.billId))
        .orderBy(desc(payments.createdAt));
    }),
});

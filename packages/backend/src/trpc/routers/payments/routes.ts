import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import { listForBill } from "./controller";
import { listForBillInputShape } from "./schemas";

export const paymentsRouter = router({
  listForBill: protectedProcedure.input(listForBillInputShape).query(listForBill),
});

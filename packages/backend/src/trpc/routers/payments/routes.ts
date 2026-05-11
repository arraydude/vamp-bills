import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import * as controller from "./controller.ts";
import { listForBillInputShape } from "./schemas.ts";

export const paymentsRouter = router({
  listForBill: protectedProcedure.input(listForBillInputShape).query(controller.listForBill),
});

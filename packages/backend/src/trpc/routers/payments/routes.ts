import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import * as controller from "./controller.ts";
import { listForBillInputShape } from "./schemas.ts";

// Read-only for now. Mutations on payments happen as side effects of
// `bills.markPaid` / `bills.cancelPayment` — there's no standalone
// payment-create or payment-edit affordance in the MVP.
export const paymentsRouter = router({
  listForBill: protectedProcedure.input(listForBillInputShape).query(controller.listForBill),
});

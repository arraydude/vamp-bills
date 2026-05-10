import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import * as controller from "./controller.ts";

// Lifecycle entries collapse to a one-line event table via the
// `controller.lifecycle()` factory. Adding a new BillEvent (and a new
// machine handler) only needs one line here + the matching state in
// `domain/bill/machine.ts`.
export const billsRouter = router({
  list: protectedProcedure.input(controller.listInputShape.optional()).query(controller.list),
  getById: protectedProcedure.input(controller.billIdInputShape).query(controller.getById),
  create: protectedProcedure.input(controller.createInputShape).mutation(controller.create),
  createBulk: protectedProcedure
    .input(controller.createBulkInputShape)
    .mutation(controller.createBulk),
  importCsv: protectedProcedure
    .input(controller.importCsvInputShape)
    .mutation(controller.importCsv),
  update: protectedProcedure.input(controller.updateInputShape).mutation(controller.update),

  submit: protectedProcedure
    .input(controller.billIdInputShape)
    .mutation(controller.lifecycle("SUBMIT", "creator")),
  approve: protectedProcedure
    .input(controller.billIdInputShape)
    .mutation(controller.lifecycle("APPROVE", "approver")),
  reject: protectedProcedure
    .input(controller.billIdInputShape)
    .mutation(controller.lifecycle("REJECT", "approver")),
  markPaid: protectedProcedure.input(controller.markPaidInputShape).mutation(controller.markPaid),
  cancelPayment: protectedProcedure
    .input(controller.billIdInputShape)
    .mutation(
      controller.lifecycle("CANCEL_PAYMENT", "creator", controller.sideEffects.cancelLatestPayment),
    ),
  archive: protectedProcedure
    .input(controller.billIdInputShape)
    .mutation(controller.lifecycle("ARCHIVE", "creator")),
  // No standalone `edit` mutation: a payload-less EDIT lets clients bounce
  // an approved/rejected bill back to `awaiting_approval` with no actual
  // change, defeating the `hasActualChange` guard in `update()`. The EDIT
  // transition still fires automatically inside `update()` when fields or
  // line items differ on an approved/rejected bill.
});

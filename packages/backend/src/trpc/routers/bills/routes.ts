import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import * as controller from "./controller.ts";

export const billsRouter = router({
  summary: protectedProcedure.query(controller.summary),
  list: protectedProcedure.input(controller.listInputShape.optional()).query(controller.list),
  getById: protectedProcedure.input(controller.billIdInputShape).query(controller.getById),
  create: protectedProcedure.input(controller.createInputShape).mutation(controller.create),
  createBulk: protectedProcedure
    .input(controller.createBulkInputShape)
    .mutation(controller.createBulk),
  importCsv: protectedProcedure
    .input(controller.importCsvInputShape)
    .mutation(controller.importCsv),
  extractFromInvoice: protectedProcedure
    .input(controller.extractFromInvoiceInputShape)
    .mutation(controller.extractFromInvoice),
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
});

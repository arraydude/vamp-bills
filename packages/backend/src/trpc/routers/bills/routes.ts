import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import { extractFromInvoice } from "./extract-invoice";
import { lifecycle, sideEffects as lifecycleSideEffects, markPaid } from "./lifecycle";
import { create, createBulk, importCsv, update } from "./mutations";
import { getById, list, summary } from "./queries";
import {
  billIdInputShape,
  createBulkInputShape,
  createInputShape,
  extractFromInvoiceInputShape,
  importCsvInputShape,
  listInputShape,
  markPaidInputShape,
  updateInputShape,
} from "./schemas";

export const billsRouter = router({
  summary: protectedProcedure.query(summary),
  list: protectedProcedure.input(listInputShape.optional()).query(list),
  getById: protectedProcedure.input(billIdInputShape).query(getById),
  create: protectedProcedure.input(createInputShape).mutation(create),
  createBulk: protectedProcedure.input(createBulkInputShape).mutation(createBulk),
  importCsv: protectedProcedure.input(importCsvInputShape).mutation(importCsv),
  extractFromInvoice: protectedProcedure
    .input(extractFromInvoiceInputShape)
    .mutation(extractFromInvoice),
  update: protectedProcedure.input(updateInputShape).mutation(update),

  submit: protectedProcedure.input(billIdInputShape).mutation(lifecycle("SUBMIT", "creator")),
  approve: protectedProcedure.input(billIdInputShape).mutation(lifecycle("APPROVE", "approver")),
  reject: protectedProcedure.input(billIdInputShape).mutation(lifecycle("REJECT", "approver")),
  markPaid: protectedProcedure.input(markPaidInputShape).mutation(markPaid),
  cancelPayment: protectedProcedure
    .input(billIdInputShape)
    .mutation(lifecycle("CANCEL_PAYMENT", "creator", lifecycleSideEffects.cancelLatestPayment)),
  archive: protectedProcedure.input(billIdInputShape).mutation(lifecycle("ARCHIVE", "creator")),
});

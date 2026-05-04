import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import * as controller from "./controller.ts";

export const billsRouter = router({
  list: protectedProcedure.input(controller.listInputShape.optional()).query(controller.list),
  getById: protectedProcedure.input(controller.billIdInputShape).query(controller.getById),
  create: protectedProcedure.input(controller.createInputShape).mutation(controller.create),
  update: protectedProcedure.input(controller.updateInputShape).mutation(controller.update),

  submit: protectedProcedure.input(controller.billIdInputShape).mutation(controller.submit),
  approve: protectedProcedure.input(controller.billIdInputShape).mutation(controller.approve),
  reject: protectedProcedure.input(controller.billIdInputShape).mutation(controller.reject),
  markPaid: protectedProcedure.input(controller.billIdInputShape).mutation(controller.markPaid),
  cancelPayment: protectedProcedure
    .input(controller.billIdInputShape)
    .mutation(controller.cancelPayment),
  archive: protectedProcedure.input(controller.billIdInputShape).mutation(controller.archive),
  edit: protectedProcedure.input(controller.billIdInputShape).mutation(controller.edit),
});

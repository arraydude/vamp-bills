import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import * as controller from "./controller.ts";

export const vendorsRouter = router({
  list: protectedProcedure.query(controller.list),
  getById: protectedProcedure.input(controller.vendorIdInputShape).query(controller.getById),
  create: protectedProcedure.input(controller.createInputShape).mutation(controller.create),
  update: protectedProcedure.input(controller.updateInputShape).mutation(controller.update),
});

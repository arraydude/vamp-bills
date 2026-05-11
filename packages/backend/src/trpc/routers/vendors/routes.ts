import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import * as controller from "./controller.ts";
import { createInputShape, updateInputShape, vendorIdInputShape } from "./schemas.ts";

export const vendorsRouter = router({
  list: protectedProcedure.query(controller.list),
  getById: protectedProcedure.input(vendorIdInputShape).query(controller.getById),
  create: protectedProcedure.input(createInputShape).mutation(controller.create),
  update: protectedProcedure.input(updateInputShape).mutation(controller.update),
});

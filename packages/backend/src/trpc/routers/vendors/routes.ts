import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import { create, getById, list, update } from "./controller";
import { createInputShape, updateInputShape, vendorIdInputShape } from "./schemas";

export const vendorsRouter = router({
  list: protectedProcedure.query(list),
  getById: protectedProcedure.input(vendorIdInputShape).query(getById),
  create: protectedProcedure.input(createInputShape).mutation(create),
  update: protectedProcedure.input(updateInputShape).mutation(update),
});

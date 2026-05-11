import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import { list } from "./controller";

export const usersRouter = router({
  list: protectedProcedure.query(list),
});

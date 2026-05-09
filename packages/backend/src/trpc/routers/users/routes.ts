import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";

import * as controller from "./controller.ts";

export const usersRouter = router({
  list: protectedProcedure.query(controller.list),
});

import type { TRPCError } from "@trpc/server";
import { createContextInner } from "@vamp-bills/backend/trpc/context.ts";
import { createCallerFactory } from "@vamp-bills/backend/trpc/trpc.ts";
import { describe, expect, test, vi } from "vitest";

import { paymentsRouter } from "./routes.ts";

// Mirror the bills/vendors test posture: stub `db/client.ts` so importing
// the controller doesn't try to open a Postgres connection during module
// load. Anything past the auth check (the actual drizzle calls) belongs in
// integration tests against real Postgres — see the PR description's
// "deferred" list.
vi.mock("@vamp-bills/backend/db/client.ts", () => ({
  db: {
    select: vi.fn(),
  },
}));

const createCaller = createCallerFactory(paymentsRouter);

describe("payments router — auth gate", () => {
  test("listForBill rejects with UNAUTHORIZED when ctx.user is null", async () => {
    const caller = createCaller(createContextInner({ user: null, session: null }));
    await expect(caller.listForBill({ billId: "b_1" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    } satisfies Partial<TRPCError>);
  });
});

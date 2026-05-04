import type { TRPCError } from "@trpc/server";
import { createContextInner } from "@vamp-bills/backend/trpc/context.ts";
import { createCallerFactory } from "@vamp-bills/backend/trpc/trpc.ts";
import { describe, expect, test, vi } from "vitest";

import { vendorsRouter } from "./routes.ts";

// Stub the db module so the auth-gate tests don't depend on a live Postgres
// pool being reachable during module init. Mirrors `bills.test.ts`.
vi.mock("@vamp-bills/backend/db/client.ts", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

const createCaller = createCallerFactory(vendorsRouter);

describe("vendors router — auth gate", () => {
  test("list rejects with UNAUTHORIZED when ctx.user is null", async () => {
    const caller = createCaller(createContextInner({ user: null, session: null }));
    await expect(caller.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    } satisfies Partial<TRPCError>);
  });

  test("getById rejects with UNAUTHORIZED when ctx.user is null", async () => {
    const caller = createCaller(createContextInner({ user: null, session: null }));
    await expect(caller.getById({ id: "v_1" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    } satisfies Partial<TRPCError>);
  });

  test("create rejects with UNAUTHORIZED when ctx.user is null", async () => {
    const caller = createCaller(createContextInner({ user: null, session: null }));
    await expect(caller.create({ name: "Acme", email: "billing@acme.test" })).rejects.toMatchObject(
      { code: "UNAUTHORIZED" } satisfies Partial<TRPCError>,
    );
  });

  test("update rejects with UNAUTHORIZED when ctx.user is null", async () => {
    const caller = createCaller(createContextInner({ user: null, session: null }));
    await expect(caller.update({ id: "v_1", name: "Acme" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    } satisfies Partial<TRPCError>);
  });
});

describe("vendors router — input validation", () => {
  // The id-only refinement is checked at the input-parsing layer, which runs
  // before any middleware (including the auth gate). A no-op patch reaches
  // Drizzle's `.set({})` and crashes — reject upstream so the FE sees a
  // normal Zod error envelope instead of a 500.
  test("update rejects an id-only payload with BAD_REQUEST (zod superRefine)", async () => {
    // Use a fake authenticated user so the failure is the input refinement,
    // not the auth gate.
    const caller = createCaller(
      createContextInner({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal user shape; the auth-gate tests above cover the real shape via BetterAuth's exported types
        user: { id: "u_1" } as any,
        session: null,
      }),
    );
    await expect(caller.update({ id: "v_1" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    } satisfies Partial<TRPCError>);
  });
});

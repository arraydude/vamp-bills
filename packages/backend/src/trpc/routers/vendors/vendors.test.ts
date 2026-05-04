import type { TRPCError } from "@trpc/server";
import { createContextInner } from "@vamp-bills/backend/trpc/context.ts";
import { createCallerFactory } from "@vamp-bills/backend/trpc/trpc.ts";
import { describe, expect, test } from "vitest";

import { vendorsRouter } from "./routes.ts";

// These tests exercise the protectedProcedure → UNAUTHORIZED gate without
// touching the db. Anything past the auth check (the actual drizzle calls)
// belongs in integration tests against real Postgres — see the PR
// description's "deferred" list.

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

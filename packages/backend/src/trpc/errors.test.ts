import { TRPCError } from "@trpc/server";
import type { DefaultErrorShape } from "@trpc/server/unstable-core-do-not-import";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { GuardFailedError } from "./errors.ts";
import { formatError } from "./trpc.ts";

// Pin the FE error contract against the *actual* exported `formatError` from
// trpc.ts (not a duplicated copy). A regression in the masking branch or the
// missingPaths/zodError lifting fails this test directly.

const stubShape = (path: string, code: TRPCError["code"], httpStatus: number): DefaultErrorShape =>
  ({
    code: -32600,
    message: code,
    data: { code, httpStatus, path },
  }) as DefaultErrorShape;

describe("GuardFailedError → formatError", () => {
  test("lifts missingPaths onto error.data.missingPaths", () => {
    const err = new TRPCError({
      code: "BAD_REQUEST",
      message: "bill_not_ready",
      cause: new GuardFailedError(["invoiceNumber", "approverId"]),
    });
    const shape = formatError(stubShape("throws", "BAD_REQUEST", 400), err, { isDev: true });
    expect(shape.data.missingPaths).toEqual(["invoiceNumber", "approverId"]);
    expect(shape.data.zodError).toBeNull();
  });

  test("zodError lifts when cause is a ZodError", () => {
    const inputSchema = z.object({ name: z.string().min(1) });
    const parsed = inputSchema.safeParse({ name: "" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const err = new TRPCError({ code: "BAD_REQUEST", message: "zod", cause: parsed.error });
    const shape = formatError(stubShape("validates", "BAD_REQUEST", 400), err, { isDev: true });
    expect(shape.data.zodError).not.toBeNull();
    expect(shape.data.missingPaths).toBeNull();
  });

  test("GuardFailedError has the expected shape", () => {
    const err = new GuardFailedError(["a", "b"]);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("GuardFailedError");
    expect(err.missingPaths).toEqual(["a", "b"]);
    expect(err.message).toBe("bill_not_ready");
  });
});

describe("formatError — production masking branch", () => {
  // The masking branch (`!isDev && code === 'INTERNAL_SERVER_ERROR'`) is
  // exercised by passing `isDev: false` into `formatError` directly, which
  // is the same call path the inline `errorFormatter` in trpc.ts uses.

  test("masks INTERNAL_SERVER_ERROR messages outside development", () => {
    const err = new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "secret SQL: SELECT * FROM bills WHERE password='hunter2'",
    });
    const shape = formatError(
      { ...stubShape("x", "INTERNAL_SERVER_ERROR", 500), message: err.message },
      err,
      { isDev: false },
    );
    expect(shape.message).toBe("Internal server error");
  });

  test("preserves INTERNAL_SERVER_ERROR messages in development", () => {
    const err = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "boom" });
    const shape = formatError(
      { ...stubShape("x", "INTERNAL_SERVER_ERROR", 500), message: err.message },
      err,
      { isDev: true },
    );
    expect(shape.message).toBe("boom");
  });

  test("does not mask non-INTERNAL_SERVER_ERROR codes even outside dev", () => {
    const err = new TRPCError({ code: "BAD_REQUEST", message: "bad input" });
    const shape = formatError(
      { ...stubShape("x", "BAD_REQUEST", 400), message: err.message },
      err,
      { isDev: false },
    );
    expect(shape.message).toBe("bad input");
  });
});

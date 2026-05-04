import { initTRPC, TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";
import { ZodError, z } from "zod";

import { GuardFailedError } from "./errors.ts";

// Re-build a tiny tRPC instance with the same errorFormatter shape as
// trpc.ts. We can't import the real one without dragging in the BetterAuth
// context — and the formatter is small enough that duplicating it in the
// test is clearer than mocking auth. If the real formatter changes shape,
// this test should be updated in the same commit so the contract stays
// pinned.
const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
        missingPaths:
          error.cause instanceof GuardFailedError ? [...error.cause.missingPaths] : null,
      },
    };
  },
});

describe("GuardFailedError → errorFormatter", () => {
  test("lifts missingPaths onto error.data.missingPaths", () => {
    const router = t.router({
      throws: t.procedure.query(() => {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "bill_not_ready",
          cause: new GuardFailedError(["invoiceNumber", "approverId"]),
        });
      }),
    });

    return router
      .createCaller({})
      .throws()
      .then(
        () => {
          throw new Error("should have thrown");
        },
        (err: TRPCError) => {
          expect(err).toBeInstanceOf(TRPCError);
          expect(err.code).toBe("BAD_REQUEST");
          // The formatter runs at the HTTP boundary, but we can apply it
          // directly here to verify the contract.
          const shape = router._def._config.errorFormatter({
            error: err,
            type: "query" as const,
            path: "throws",
            input: undefined,
            ctx: {},
            shape: {
              code: -32600,
              message: err.message,
              data: { code: err.code, httpStatus: 400, path: "throws" },
            },
          });
          expect(shape.data.missingPaths).toEqual(["invoiceNumber", "approverId"]);
          expect(shape.data.zodError).toBeNull();
        },
      );
  });

  test("zodError lifts when cause is a ZodError", () => {
    const inputSchema = z.object({ name: z.string().min(1) });
    const router = t.router({
      validates: t.procedure.input(inputSchema).query(() => "ok"),
    });

    return router
      .createCaller({})
      .validates({ name: "" })
      .then(
        () => {
          throw new Error("should have thrown");
        },
        (err: TRPCError) => {
          expect(err.code).toBe("BAD_REQUEST");
          const shape = router._def._config.errorFormatter({
            error: err,
            type: "query" as const,
            path: "validates",
            input: { name: "" },
            ctx: {},
            shape: {
              code: -32600,
              message: err.message,
              data: { code: err.code, httpStatus: 400, path: "validates" },
            },
          });
          expect(shape.data.zodError).not.toBeNull();
          expect(shape.data.missingPaths).toBeNull();
        },
      );
  });

  test("GuardFailedError has the expected shape", () => {
    const err = new GuardFailedError(["a", "b"]);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("GuardFailedError");
    expect(err.missingPaths).toEqual(["a", "b"]);
    expect(err.message).toBe("bill_not_ready");
  });
});

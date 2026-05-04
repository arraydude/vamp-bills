import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

import type { Context } from "./context.ts";
import { GuardFailedError } from "./errors.ts";

// `errorFormatter` shape comes from the `@trpc/server#error-handling` skill:
// the FE reads `error.data.zodError` for field-level validation issues and
// `error.data.missingPaths` for state-machine readiness failures (the
// `bills.submit` "what's blocking?" UX). New domain error carriers belong in
// `./errors.ts` and get a corresponding entry below.
//
// `isDev` is set explicitly per the same skill — without it, stack-trace
// behavior depends on the runtime's NODE_ENV defaulting, which differs
// between local Node and Vercel Functions.
const isDev = process.env.NODE_ENV === "development";

const t = initTRPC.context<Context>().create({
  isDev,
  errorFormatter({ shape, error }) {
    // Plain Errors (or anything not explicitly thrown as a TRPCError) come
    // through as INTERNAL_SERVER_ERROR with the original message verbatim —
    // for drizzle/pg failures that means the full SQL + bound params get
    // echoed to the client. Mask the message at the boundary; keep the
    // detail visible in dev for debugging via the server-side onError logs.
    const message =
      !isDev && error.code === "INTERNAL_SERVER_ERROR" ? "Internal server error" : shape.message;
    return {
      ...shape,
      message,
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

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({ ctx: { ...ctx, user: ctx.user } });
});

// Exported for unit tests per the `@trpc/server#server-side-calls` skill:
// `createCaller(ctx)` lets vitest invoke procedures without an HTTP layer
// and without re-running the BetterAuth session resolver.
export const createCallerFactory = t.createCallerFactory;

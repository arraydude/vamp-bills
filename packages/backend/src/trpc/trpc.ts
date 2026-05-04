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
const t = initTRPC.context<Context>().create({
  isDev: process.env.NODE_ENV === "development",
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

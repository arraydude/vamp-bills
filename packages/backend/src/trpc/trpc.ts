import { initTRPC, TRPCError } from "@trpc/server";
import type { DefaultErrorShape } from "@trpc/server/unstable-core-do-not-import";
import { ZodError } from "zod";

import type { Context } from "./context.ts";
import { GuardFailedError } from "./errors.ts";

const isDev = process.env.NODE_ENV === "development";

export type FormattedErrorShape = DefaultErrorShape & {
  data: DefaultErrorShape["data"] & {
    zodError: ReturnType<ZodError["flatten"]> | null;
    missingPaths: string[] | null;
  };
};

// Exported so tests can pin the FE error contract without rebuilding the shape.
export function formatError(
  shape: DefaultErrorShape,
  error: TRPCError,
  opts: { isDev: boolean },
): FormattedErrorShape {
  // Mask DB/internal errors in prod — raw SQL + params would leak otherwise.
  const message =
    !opts.isDev && error.code === "INTERNAL_SERVER_ERROR" ? "Internal server error" : shape.message;
  return {
    ...shape,
    message,
    data: {
      ...shape.data,
      zodError:
        error.code === "BAD_REQUEST" && error.cause instanceof ZodError
          ? error.cause.flatten()
          : null,
      missingPaths: error.cause instanceof GuardFailedError ? [...error.cause.missingPaths] : null,
    },
  };
}

const t = initTRPC.context<Context>().create({
  isDev,
  errorFormatter({ shape, error }) {
    return formatError(shape, error, { isDev });
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

export const createCallerFactory = t.createCallerFactory;

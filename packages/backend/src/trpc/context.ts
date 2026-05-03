import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.ts";

export async function createContext({ req }: CreateExpressContextOptions) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  return { user: session?.user ?? null, session: session?.session ?? null };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

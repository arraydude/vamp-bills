import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { auth } from "@vamp-bills/backend/auth.ts";
import { fromNodeHeaders } from "better-auth/node";

// Vercel's @vercel/node tsc pass intermittently fails to resolve
// `http.IncomingMessage` through the @types/express → @types/node chain
// (DefinitelyTyped/DefinitelyTyped#40138, similar reports across @vercel/node
// monorepo deploys). Locally typechecks fine; on Vercel the Request<...>
// generic falls back to the bare interface without `headers`.
//
// Since `fromNodeHeaders` only needs an indexable map, we cast structurally
// to bypass the brittle inheritance chain. Runtime shape is unchanged.
type NodeRequestHeaders = Record<string, string | string[] | undefined>;

type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;
type AuthUser = NonNullable<SessionData>["user"];
type AuthSession = NonNullable<SessionData>["session"];

// Inner context — pure object shape, no IO. Call directly from unit tests
// (`createContextInner({ user, session: null })`) so vitest doesn't have to
// stand up BetterAuth or fake an Express request. Pattern from the
// `@trpc/server#server-side-calls` skill: callers must satisfy the shape
// the protectedProcedure middleware expects, hence the dedicated factory.
export type Context = {
  user: AuthUser | null;
  session: AuthSession | null;
};

export function createContextInner(opts: Context): Context {
  return { user: opts.user, session: opts.session };
}

export async function createContext({ req }: CreateExpressContextOptions): Promise<Context> {
  const headers = (req as unknown as { headers: NodeRequestHeaders }).headers;
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
  return createContextInner({
    user: session?.user ?? null,
    session: session?.session ?? null,
  });
}

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

// Type-only so unit tests can import context.ts without pulling in auth.ts → env.ts.
import type { auth as AuthType } from "@vamp-bills/backend/auth.ts";

// Structural cast — Vercel's tsc can't resolve the @types/express → @types/node headers chain.
type NodeRequestHeaders = Record<string, string | string[] | undefined>;

type SessionData = Awaited<ReturnType<typeof AuthType.api.getSession>>;
type AuthUser = NonNullable<SessionData>["user"];
type AuthSession = NonNullable<SessionData>["session"];

export type Context = {
  user: AuthUser | null;
  session: AuthSession | null;
};

export function createContextInner(opts: Context): Context {
  return { user: opts.user, session: opts.session };
}

export async function createContext({ req }: CreateExpressContextOptions): Promise<Context> {
  const { auth } = await import("@vamp-bills/backend/auth.ts");
  const { fromNodeHeaders } = await import("better-auth/node");
  const headers = (req as unknown as { headers: NodeRequestHeaders }).headers;
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
  return createContextInner({
    user: session?.user ?? null,
    session: session?.session ?? null,
  });
}

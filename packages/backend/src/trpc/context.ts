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

export async function createContext({ req }: CreateExpressContextOptions) {
  const headers = (req as unknown as { headers: NodeRequestHeaders }).headers;
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
  return { user: session?.user ?? null, session: session?.session ?? null };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

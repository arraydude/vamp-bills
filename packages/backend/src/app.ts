import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth.ts";
import { createContext } from "./trpc/context.ts";
import { appRouter } from "./trpc/router.ts";

// Builds the Express app without listening. Local dev (src/index.ts) wraps it
// in app.listen(); Vercel serverless (root api/index.ts) re-exports it as
// the default handler. Same wiring on both paths.
export function createApp() {
  const app = express();

  app.use(cors());

  // BetterAuth's handler reads the raw request body — it must be mounted
  // before any JSON body parser. tRPC's middleware is the same.
  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  return app;
}

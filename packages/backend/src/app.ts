import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth.ts";
import { createContext } from "./trpc/context.ts";
import { appRouter } from "./trpc/router.ts";

export function createApp() {
  const app = express();

  app.use(cors());

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

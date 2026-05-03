import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth.ts";
import { env } from "./env.ts";
import { createContext } from "./trpc/context.ts";
import { appRouter } from "./trpc/router.ts";

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

app.listen(env.PORT, () => {
  console.log(`backend listening on http://localhost:${env.PORT}`);
});

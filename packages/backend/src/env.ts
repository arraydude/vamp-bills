import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

// Resolve .env paths from this file's location, not the process CWD.
// dotenv.config({ path }) is CWD-relative by default; using import.meta.url
// makes loading robust whether the server is launched from the package dir
// or anywhere else (CI, monorepo task runners, etc.).
// File: packages/backend/src/env.ts → workspace root is three levels up.
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

loadEnv({ path: [path.join(repoRoot, ".env.local"), path.join(repoRoot, ".env")] });

const schema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  PORT: z.coerce.number().int().positive().default(3000),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

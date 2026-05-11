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
  // Optional in the schema — when not set explicitly we derive it from
  // Vercel's `VERCEL_URL` system env var (always set on every Vercel
  // deployment, including per-PR previews). This avoids having to pin
  // BETTER_AUTH_URL per-branch in Vercel project settings, which is what
  // bit feature-branch previews previously: the explicit env var was
  // scoped to specific branches and absent on every other PR's preview.
  BETTER_AUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().default(""),
  PORT: z.coerce.number().int().positive().default(3000),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

const vercelUrl = process.env.VERCEL_URL;
const betterAuthUrl =
  parsed.data.BETTER_AUTH_URL ?? (vercelUrl ? `https://${vercelUrl}` : undefined);

if (!betterAuthUrl) {
  throw new Error(
    "BETTER_AUTH_URL must be set explicitly when not running on Vercel " +
      "(VERCEL_URL not present in process.env). Set it in .env.local for local dev.",
  );
}

export const env = { ...parsed.data, BETTER_AUTH_URL: betterAuthUrl };

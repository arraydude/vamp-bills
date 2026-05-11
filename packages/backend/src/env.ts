import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

// Resolve from file location, not CWD — robust across monorepo task runners and CI.
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

loadEnv({ path: [path.join(repoRoot, ".env.local"), path.join(repoRoot, ".env")] });

const schema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  // Falls back to VERCEL_URL on deployments so we don't need per-branch config.
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

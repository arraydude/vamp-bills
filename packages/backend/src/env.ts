import { config as loadEnv } from "dotenv";
import { z } from "zod";

// Load .env from the workspace root (../../.env relative to this file).
// Backend processes are launched from the package dir; .env lives at repo root.
loadEnv({ path: ["../../.env.local", "../../.env"] });

const schema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

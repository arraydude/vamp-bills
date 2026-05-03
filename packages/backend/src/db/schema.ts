// Aggregates the BetterAuth-generated tables and the application tables.
// `auth-schema.ts` is produced by `pnpm auth:generate` (do not hand-edit).
// `app-schema.ts` holds the Bill Pay tables (vendors, bills, line items, payments).

export * from "./app-schema.ts";
export * from "./auth-schema.ts";

// Re-exports the BetterAuth-generated schema. The auth-schema.ts file is
// produced by `pnpm auth:generate` and contains the user/session/account/
// verification tables. Application tables (Bills/Vendors/Payments) will be
// added here in a follow-up spec.
export * from "./auth-schema.ts";

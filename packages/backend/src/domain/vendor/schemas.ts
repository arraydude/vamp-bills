import { vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Mirrors the bill schema posture (`domain/bill/schemas.ts`): drizzle-zod
// owns the column shape, refinements layer above. Server-managed columns
// are stripped from the insert side — `id` defaults to gen_random_uuid()
// in Postgres, timestamps default in DB.
//
// The router uses this for `vendors.create`. `vendors.update` defines its
// input inline as `insertVendorSchema.partial()` plus an `id` — small
// enough to live next to the procedure rather than be re-exported.

const requiredText = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { message: `${label} is required` });

export const insertVendorSchema = createInsertSchema(vendors)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: requiredText("vendor_name"),
    email: z.string().trim().email({ message: "vendor_email must be a valid email" }),
  });

export type InsertVendor = z.infer<typeof insertVendorSchema>;

import { vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { requiredText } from "@vamp-bills/backend/domain/validators.ts";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const insertVendorSchema = createInsertSchema(vendors)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: requiredText("name"),
    email: z.string().trim().email({ message: "email must be a valid email" }),
  });

export type InsertVendor = z.infer<typeof insertVendorSchema>;

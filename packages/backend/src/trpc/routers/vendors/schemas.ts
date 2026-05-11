import { insertVendorSchema } from "@vamp-bills/backend/domain/vendor/schemas.ts";
import { z } from "zod";

export const vendorIdInputShape = z.object({ id: z.string().min(1) });
export type VendorIdInput = z.infer<typeof vendorIdInputShape>;

export const createInputShape = insertVendorSchema;
export type CreateInput = z.infer<typeof createInputShape>;

export const updateInputShape = insertVendorSchema
  .partial()
  .extend({
    id: z.string().min(1, { message: "id is required" }),
  })
  .superRefine((val, ctx) => {
    const { id: _id, ...rest } = val;
    const hasFieldPatch = Object.values(rest).some((v) => v !== undefined);
    if (!hasFieldPatch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "at least one field must be provided to update",
      });
    }
  });
export type UpdateInput = z.infer<typeof updateInputShape>;

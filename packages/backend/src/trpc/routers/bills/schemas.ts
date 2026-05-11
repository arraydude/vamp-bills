import { insertBillSchema, insertLineItemSchema } from "@vamp-bills/backend/domain/bill/schemas.ts";
import { type BillStatus, billStatusSchema } from "@vamp-bills/backend/domain/bill/status.ts";
import { z } from "zod";

export type ListInput = {
  status?: BillStatus | BillStatus[] | "all";
  scope?: "mine" | "approving" | "all";
};
export const listInputShape = z.object({
  status: z
    .union([billStatusSchema, z.array(billStatusSchema).min(1), z.literal("all")])
    .optional(),
  scope: z.enum(["mine", "approving", "all"]).optional(),
});

export type CreateInput = z.infer<typeof createInputShape>;
export const createInputShape = insertBillSchema.extend({
  lineItems: z.array(insertLineItemSchema).min(1, "at least one line item is required"),
});

export type UpdateInput = z.infer<typeof updateInputShape>;
export const updateInputShape = insertBillSchema
  .partial()
  .extend({
    id: z.string().min(1),
    lineItems: z.array(insertLineItemSchema).optional(),
  })
  // Reject id-only payloads — would fire a no-op EDIT on approved/rejected bills.
  .superRefine((val, ctx) => {
    const { id: _id, lineItems, ...rest } = val;
    const hasFieldPatch = Object.values(rest).some((v) => v !== undefined);
    if (!hasFieldPatch && lineItems === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "at least one field must be provided to update",
      });
    }
  });

export const billIdInputShape = z.object({ id: z.string().min(1) });
export type BillIdInput = z.infer<typeof billIdInputShape>;

export const csvRowSchema = z.object({
  vendor: z.string().trim().min(1, "vendor name is required"),
  invoiceNumber: z.string().trim().min(1, "invoice number is required"),
  description: z.string().trim().min(1, "description is required"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "must be a valid decimal"),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
export type CsvRow = z.infer<typeof csvRowSchema>;

export const createBulkInputShape = z.object({
  rows: z.array(csvRowSchema).min(1, "at least one row is required").max(500),
});
export type CreateBulkInput = z.infer<typeof createBulkInputShape>;

export const importCsvInputShape = z.object({
  csv: z.string().min(1, "CSV content is required"),
  dryRun: z.boolean().optional(),
});
export type ImportCsvInput = z.infer<typeof importCsvInputShape>;

export const markPaidInputShape = billIdInputShape.extend({
  reference: z.string().trim().optional(),
});
export type MarkPaidInput = z.infer<typeof markPaidInputShape>;

export const extractFromInvoiceInputShape = z.object({
  base64: z.string().min(1, "file content is required"),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp", "application/pdf"], {
    message: "unsupported file type — use PNG, JPEG, WebP, or PDF",
  }),
});
export type ExtractFromInvoiceInput = z.infer<typeof extractFromInvoiceInputShape>;

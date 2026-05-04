import { TRPCError } from "@trpc/server";
import { vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { insertVendorSchema } from "@vamp-bills/backend/domain/vendor/schemas.ts";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

// Public input schemas (referenced by routes.ts) + handler implementations.

export const vendorIdInputShape = z.object({ id: z.string().min(1) });
export type VendorIdInput = z.infer<typeof vendorIdInputShape>;

export const createInputShape = insertVendorSchema;
export type CreateInput = z.infer<typeof createInputShape>;

// Reject id-only payloads. Without this, `vendors.update({ id })` reaches
// `db.update(vendors).set({})`, which Drizzle's update builder rejects at
// runtime — surface the bad input as a normal 4xx instead of a 500.
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

export async function list() {
  return db.select().from(vendors).orderBy(asc(vendors.name));
}

export async function getById({ input }: { input: VendorIdInput }) {
  const [row] = await db.select().from(vendors).where(eq(vendors.id, input.id)).limit(1);
  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: `vendor ${input.id} not found` });
  }
  return row;
}

export async function create({ input }: { input: CreateInput }) {
  const [row] = await db.insert(vendors).values(input).returning();
  if (!row) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "vendor insert returned no row",
    });
  }
  return row;
}

export async function update({ input }: { input: UpdateInput }) {
  const { id, ...patch } = input;
  const [row] = await db.update(vendors).set(patch).where(eq(vendors.id, id)).returning();
  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: `vendor ${id} not found` });
  }
  return row;
}

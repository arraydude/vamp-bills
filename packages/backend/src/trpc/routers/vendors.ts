import { TRPCError } from "@trpc/server";
import { vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { insertVendorSchema } from "@vamp-bills/backend/domain/vendor/schemas.ts";
import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

const updateVendorSchema = insertVendorSchema.partial().extend({
  id: z.string().min(1, { message: "id is required" }),
});

export const vendorsRouter = router({
  list: protectedProcedure.query(async () => {
    return db.select().from(vendors).orderBy(asc(vendors.name));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const [row] = await db.select().from(vendors).where(eq(vendors.id, input.id)).limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: `vendor ${input.id} not found` });
      }
      return row;
    }),

  create: protectedProcedure.input(insertVendorSchema).mutation(async ({ input }) => {
    const [row] = await db.insert(vendors).values(input).returning();
    if (!row) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "vendor insert returned no row",
      });
    }
    return row;
  }),

  update: protectedProcedure.input(updateVendorSchema).mutation(async ({ input }) => {
    const { id, ...patch } = input;
    const [row] = await db.update(vendors).set(patch).where(eq(vendors.id, id)).returning();
    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: `vendor ${id} not found` });
    }
    return row;
  }),
});

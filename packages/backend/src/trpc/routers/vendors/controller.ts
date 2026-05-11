import { TRPCError } from "@trpc/server";
import { vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { asc, eq } from "drizzle-orm";

import type { CreateInput, UpdateInput, VendorIdInput } from "./schemas";

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

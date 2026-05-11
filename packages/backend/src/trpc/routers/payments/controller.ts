import { TRPCError } from "@trpc/server";
import { bills, payments } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { desc, eq } from "drizzle-orm";

import type { ListForBillInput } from "./schemas.ts";

export async function listForBill({ input }: { input: ListForBillInput }) {
  const [bill] = await db
    .select({ id: bills.id })
    .from(bills)
    .where(eq(bills.id, input.billId))
    .limit(1);
  if (!bill) {
    throw new TRPCError({ code: "NOT_FOUND", message: `bill ${input.billId} not found` });
  }
  return db
    .select()
    .from(payments)
    .where(eq(payments.billId, input.billId))
    .orderBy(desc(payments.createdAt));
}

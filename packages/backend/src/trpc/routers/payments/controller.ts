import { payments } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export const listForBillInputShape = z.object({ billId: z.string().min(1) });
export type ListForBillInput = z.infer<typeof listForBillInputShape>;

export async function listForBill({ input }: { input: ListForBillInput }) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.billId, input.billId))
    .orderBy(desc(payments.createdAt));
}

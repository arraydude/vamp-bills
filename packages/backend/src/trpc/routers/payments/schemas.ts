import { z } from "zod";

export const listForBillInputShape = z.object({ billId: z.string().min(1) });
export type ListForBillInput = z.infer<typeof listForBillInputShape>;

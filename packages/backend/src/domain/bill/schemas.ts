import { billLineItems, bills } from "@vamp-bills/backend/db/app-schema.ts";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auto-derived from Drizzle column shapes. Used at tRPC mutation boundaries
// (bills.create, bills.update — future PR) and as the base shape for the
// stricter `readyBillSchema` below. Adding a column to `bills` in
// app-schema.ts flows through here automatically.
export const insertBillSchema = createInsertSchema(bills);
export const insertLineItemSchema = createInsertSchema(billLineItems);

const requiredText = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { message: `${label} is required` });

const decimalAmount = z.string().regex(/^\d+(\.\d{1,2})?$/, {
  message: "must be a non-negative decimal with up to 2 fractional digits",
});

// "Ready to submit" — the spec's `Draft (Ready)` predicate. Layered on top of
// the column shapes with domain refinements that sit above the DB level
// (whitespace-only strings, decimal format, ≥1 line item, totals reconcile).
//
// Used by:
//  - the XState `isReady` guard (via the boolean wrapper below)
//  - the eventual `bills.submit` tRPC mutation (input validation + early reject)
//  - the eventual UI "what's blocking submit?" display (via `missingPaths`)
export const readyBillSchema = insertBillSchema
  .extend({
    invoiceNumber: requiredText("invoice_number"),
    description: requiredText("description"),
    totalAmount: decimalAmount,
    lineItems: z
      .array(
        z.object({
          description: z.string(),
          amount: decimalAmount,
          position: z.number().int().nonnegative(),
        }),
      )
      .min(1, { message: "at least one line item is required" }),
  })
  .superRefine((bill, ctx) => {
    const totalCents = toCents(bill.totalAmount);
    const sumCents = bill.lineItems.reduce((acc, li) => acc + toCents(li.amount), 0);
    if (Number.isFinite(totalCents) && Number.isFinite(sumCents) && totalCents !== sumCents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalAmount"],
        message: "totals_reconcile",
      });
    }
  });

export type ReadyBill = z.infer<typeof readyBillSchema>;

export function isReady(bill: unknown): boolean {
  return readyBillSchema.safeParse(bill).success;
}

// Returns the list of top-level field paths that are blocking a "ready" parse.
// Output is `string[]` (Zod issue paths) — UI consumers can switch on the
// strings or narrow against `Object.keys(readyBillSchema.shape)` for an
// exhaustive check.
export function missingPaths(bill: unknown): string[] {
  const result = readyBillSchema.safeParse(bill);
  if (result.success) return [];
  // De-dupe: a field can have multiple issues (e.g. "is required" + nested
  // refine). Caller wants "which fields are blocking", not "how many issues".
  const paths = new Set<string>();
  for (const issue of result.error.issues) {
    const head = issue.path[0];
    if (head !== undefined) paths.add(String(head));
  }
  return [...paths];
}

// Sum line-item amounts as integer cents to avoid float drift on `numeric(12, 2)`
// strings from node-postgres. Empty/whitespace strings rejected up front so
// blank line items don't silently count as zero.
function toCents(amount: string): number {
  if (amount.trim() === "") return Number.NaN;
  const n = Number(amount);
  return Number.isFinite(n) ? Math.round(n * 100) : Number.NaN;
}

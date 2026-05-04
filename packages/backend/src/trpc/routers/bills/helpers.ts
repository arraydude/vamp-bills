import { TRPCError } from "@trpc/server";
import { billLineItems, bills, payments } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { missingPaths } from "@vamp-bills/backend/domain/bill/schemas.ts";
import type { BillStatus } from "@vamp-bills/backend/domain/bill/status.ts";
import {
  attemptTransition,
  availableEvents,
  derivedReadiness,
} from "@vamp-bills/backend/domain/bill/transitions.ts";
import type { Context } from "@vamp-bills/backend/trpc/context.ts";
import { GuardFailedError } from "@vamp-bills/backend/trpc/errors.ts";
import { asc, desc, eq } from "drizzle-orm";

// Narrowed context shape inside `protectedProcedure` — used by controller
// handlers that import this module directly. Mirrors the narrowing tRPC
// performs in `trpc.ts` so handlers in `controller.ts` get `ctx.user.id`
// without needing to import tRPC's procedure-builder type machinery.
export type AuthedCtx = Omit<Context, "user"> & { user: NonNullable<Context["user"]> };

export type BillRow = typeof bills.$inferSelect;
export type BillLineItemRow = typeof billLineItems.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;

export type Bundle = {
  bill: BillRow;
  lineItems: BillLineItemRow[];
  payment: PaymentRow | null;
};

// Single canonical contract for FE: every `getById` and lifecycle mutation
// returns this shape so the FE never re-derives availableEvents / missingPaths.
// Built inline (never via `createCaller`) per the @trpc/server#server-side-calls
// skill — invoking createCaller inside a procedure re-runs middleware and
// re-validates input, which is the wrong pattern.
export type HydratedBill = {
  bill: BillRow;
  lineItems: BillLineItemRow[];
  payment: PaymentRow | null;
  availableEvents: ReturnType<typeof availableEvents>;
  missingPaths: string[];
};

// Auth helpers — load the bill first, then check. Can't run as middleware
// because the bill row drives the check (creator vs approver).
export function assertCreator(bill: BillRow, userId: string): void {
  if (bill.createdBy !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "only the bill creator can perform this action",
    });
  }
}

export function assertApprover(bill: BillRow, userId: string): void {
  if (bill.approverId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "only the bill approver can perform this action",
    });
  }
}

export function hydrate(
  bill: BillRow,
  lineItems: BillLineItemRow[],
  payment: PaymentRow | null,
): HydratedBill {
  const ordered = [...lineItems].sort((a, b) => a.position - b.position);
  const derived = derivedReadiness({ ...bill, lineItems: ordered });
  return {
    bill,
    lineItems: ordered,
    payment,
    availableEvents: availableEvents(bill.status, derived),
    missingPaths: missingPaths({ ...bill, lineItems: ordered }),
  };
}

// Loads bill + line items + most-recent payment in three queries (drizzle's
// relational query API would collapse to one but returns nested rows that
// are awkward to feed back into hydrate's flat shape — three short queries
// are easier to read and the seed data is small).
export async function loadBundle(billId: string): Promise<Bundle> {
  const [bill] = await db.select().from(bills).where(eq(bills.id, billId)).limit(1);
  if (!bill) {
    throw new TRPCError({ code: "NOT_FOUND", message: `bill ${billId} not found` });
  }
  const lineItems = await db
    .select()
    .from(billLineItems)
    .where(eq(billLineItems.billId, billId))
    .orderBy(asc(billLineItems.position));
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.billId, billId))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  return { bill, lineItems, payment: payment ?? null };
}

// Maps attemptTransition's failure variants onto TRPCError. Unguarded
// transitions that legitimately leave the value unchanged (CANCEL_PAYMENT
// in approved) come back as `ok: true, nextStatus: current` — the caller
// handles that case naturally without going through this helper.
//
// `lineItems` is widened to "the minimum readiness shape" so the update
// mutation can pass a mix of fresh inputs (no id/billId/timestamps) and
// persisted rows. derivedReadiness/missingPaths only inspect
// description/amount/position, so extra columns are ignored.
export type ReadinessLineItem = {
  description: string;
  amount: string;
  position: number;
};

export function transitionOrThrow(
  current: BillStatus,
  event: Parameters<typeof attemptTransition>[1],
  bundle: { bill: BillRow; lineItems: readonly ReadinessLineItem[] },
): BillStatus {
  const derived = derivedReadiness({ ...bundle.bill, lineItems: bundle.lineItems });
  const result = attemptTransition(current, event, derived);
  if (result.ok) return result.nextStatus;
  if (result.kind === "wrong_state") {
    throw new TRPCError({ code: "BAD_REQUEST", message: result.reason });
  }
  // guard_failed → surface missingPaths via errorFormatter
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: result.reason,
    cause: new GuardFailedError(missingPaths({ ...bundle.bill, lineItems: bundle.lineItems })),
  });
}

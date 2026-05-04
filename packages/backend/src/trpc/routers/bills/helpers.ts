import { TRPCError } from "@trpc/server";
import { billLineItems, bills, payments, vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { user } from "@vamp-bills/backend/db/auth-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { missingPaths } from "@vamp-bills/backend/domain/bill/schemas.ts";
import type { BillStatus } from "@vamp-bills/backend/domain/bill/status.ts";
import {
  type ActorRoles,
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

// Derive the caller's role(s) on a given bill. Mirrors the predicates in
// `assertCreator` / `assertApprover` so the action ribbon is filtered by the
// same rules the lifecycle mutations enforce.
//
// Returns a Set so a self-approved bill (`createdBy === approverId`) holds
// both roles — the action ribbon shows the union of creator + approver
// actions, preserving the spec's "Self-approved" demo flow. An empty set
// means the caller is neither (a third-party reader); they get an empty
// available-events list.
export function actorRoles(bill: BillRow, userId: string): ActorRoles {
  const roles = new Set<"creator" | "approver">();
  if (bill.createdBy === userId) roles.add("creator");
  if (bill.approverId === userId) roles.add("approver");
  return roles;
}

export function hydrate(
  bill: BillRow,
  lineItems: BillLineItemRow[],
  payment: PaymentRow | null,
  userId: string,
): HydratedBill {
  const ordered = [...lineItems].sort((a, b) => a.position - b.position);
  const derived = derivedReadiness({ ...bill, lineItems: ordered });
  return {
    bill,
    lineItems: ordered,
    payment,
    availableEvents: availableEvents(bill.status, derived, actorRoles(bill, userId)),
    missingPaths: missingPaths({ ...bill, lineItems: ordered }),
  };
}

// Pre-flight FK existence checks. The bills table has notNull text FKs to
// `vendors.id` and `user.id`; passing a non-empty but unknown id sails past
// the Zod required-text refinement and hits the Postgres FK constraint as a
// generic Error. The errorFormatter masks that to "Internal server error" in
// prod, so a typoed vendor id becomes a 500 to the client. Pre-check here so
// it surfaces as a normal 4xx instead.
export async function assertVendorExists(vendorId: string): Promise<void> {
  const [row] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.id, vendorId))
    .limit(1);
  if (!row) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `vendor ${vendorId} not found` });
  }
}

export async function assertApproverExists(approverId: string): Promise<void> {
  const [row] = await db.select({ id: user.id }).from(user).where(eq(user.id, approverId)).limit(1);
  if (!row) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `approver ${approverId} not found` });
  }
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

// Maps attemptTransition's failure variants onto TRPCError. After the
// paid-only CANCEL_PAYMENT rework no event in the machine is a self-action,
// so `ok: true` always implies a real status change. The caller is still
// expected to handle nextStatus === current defensively (the lifecycle
// factory does, by skipping both the bills UPDATE and any side effect).
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

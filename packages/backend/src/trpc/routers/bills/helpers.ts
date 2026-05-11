import { TRPCError } from "@trpc/server";
import { billLineItems, bills, payments, vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { user } from "@vamp-bills/backend/db/auth-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import type { ReadinessLineItem } from "@vamp-bills/backend/domain/bill/schemas.ts";
import { missingPaths } from "@vamp-bills/backend/domain/bill/schemas.ts";
import type { BillStatus } from "@vamp-bills/backend/domain/bill/status.ts";
import {
  type ActorRoles,
  attemptTransition,
  availableEvents,
  derivedReadiness,
} from "@vamp-bills/backend/domain/bill/transitions.ts";
import { GuardFailedError } from "@vamp-bills/backend/trpc/errors.ts";
import { asc, desc, eq } from "drizzle-orm";

import type { BillLineItemRow, BillRow, Bundle, HydratedBill, PaymentRow } from "./types";

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
  approverName: string | null,
): HydratedBill {
  const ordered = [...lineItems].sort((a, b) => a.position - b.position);
  const derived = derivedReadiness({ ...bill, lineItems: ordered });
  return {
    bill,
    lineItems: ordered,
    payment,
    availableEvents: availableEvents(bill.status, derived, actorRoles(bill, userId)),
    missingPaths: missingPaths({ ...bill, lineItems: ordered }),
    approverName,
  };
}

export async function fetchApproverName(approverId: string): Promise<string | null> {
  const [row] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, approverId))
    .limit(1);
  return row?.name ?? null;
}

// Pre-check FKs so bad ids surface as 4xx, not masked 500s from the DB constraint.
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
  const approverName = await fetchApproverName(bill.approverId);
  return { bill, lineItems, payment: payment ?? null, approverName };
}

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

import { TRPCError } from "@trpc/server";
import { bills, payments } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import type { BillEventType } from "@vamp-bills/backend/domain/bill/events.ts";
import { and, eq } from "drizzle-orm";

import {
  assertApprover,
  assertCreator,
  assertCreatorOrApprover,
  hydrate,
  loadBundle,
  transitionOrThrow,
} from "./helpers";
import type { BillIdInput, MarkPaidInput } from "./schemas";
import type { AuthedCtx, BillRow, Bundle, HydratedBill, PaymentRow } from "./types";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type LifecycleSideEffect = (tx: Tx, bundle: Bundle) => Promise<PaymentRow | null>;

export function insertPayment(reference?: string): LifecycleSideEffect {
  return async (tx, bundle) => {
    const [row] = await tx
      .insert(payments)
      .values({
        billId: bundle.bill.id,
        amount: bundle.bill.totalAmount,
        status: "paid",
        paidAt: new Date().toISOString(),
        reference: reference || null,
      })
      .returning();
    if (!row) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "payment insert returned no row",
      });
    }
    return row;
  };
}

export const sideEffects = {
  cancelLatestPayment: async (tx, bundle) => {
    if (!bundle.payment) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "no payment to cancel for this bill",
      });
    }
    const [cancelled] = await tx
      .update(payments)
      .set({ status: "cancelled" })
      .where(eq(payments.id, bundle.payment.id))
      .returning();
    return cancelled ?? bundle.payment;
  },
} satisfies Record<string, LifecycleSideEffect>;

export function lifecycle(
  event: BillEventType,
  role: "creator" | "approver",
  sideEffect?: LifecycleSideEffect,
) {
  return async ({ input, ctx }: { input: BillIdInput; ctx: AuthedCtx }): Promise<HydratedBill> => {
    const bundle = await loadBundle(input.id);
    (role === "creator" ? assertCreator : assertApprover)(bundle.bill, ctx.user.id);
    const nextStatus = transitionOrThrow(bundle.bill.status, { type: event }, bundle);

    const result = await db.transaction(async (tx) => {
      let updatedBill: BillRow = bundle.bill;
      let payment = bundle.payment;
      if (nextStatus !== bundle.bill.status) {
        const [row] = await tx
          .update(bills)
          .set({ status: nextStatus })
          .where(
            and(
              eq(bills.id, input.id),
              eq(bills.status, bundle.bill.status),
              eq(bills.updatedAt, bundle.bill.updatedAt),
            ),
          )
          .returning();
        if (!row) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "bill state changed; reload and retry",
          });
        }
        updatedBill = row;
        if (sideEffect) {
          payment = await sideEffect(tx, bundle);
        }
      }
      return { bill: updatedBill, payment };
    });

    return hydrate(result.bill, bundle.lineItems, result.payment, ctx.user.id, bundle.approverName);
  };
}

export async function markPaid({
  input,
  ctx,
}: {
  input: MarkPaidInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const bundle = await loadBundle(input.id);
  assertCreatorOrApprover(bundle.bill, ctx.user.id);
  const nextStatus = transitionOrThrow(bundle.bill.status, { type: "MARK_PAID" }, bundle);

  const result = await db.transaction(async (tx) => {
    let updatedBill: BillRow = bundle.bill;
    let payment = bundle.payment;
    if (nextStatus !== bundle.bill.status) {
      const [row] = await tx
        .update(bills)
        .set({ status: nextStatus })
        .where(
          and(
            eq(bills.id, input.id),
            eq(bills.status, bundle.bill.status),
            eq(bills.updatedAt, bundle.bill.updatedAt),
          ),
        )
        .returning();
      if (!row) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "bill state changed; reload and retry",
        });
      }
      updatedBill = row;
      payment = await insertPayment(input.reference)(tx, bundle);
    }
    return { bill: updatedBill, payment };
  });

  return hydrate(result.bill, bundle.lineItems, result.payment, ctx.user.id, bundle.approverName);
}

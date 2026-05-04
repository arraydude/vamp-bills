import { TRPCError } from "@trpc/server";
import { billLineItems, bills, payments, vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import type { BillEventType } from "@vamp-bills/backend/domain/bill/events.ts";
import { insertBillSchema, insertLineItemSchema } from "@vamp-bills/backend/domain/bill/schemas.ts";
import { type BillStatus, billStatusSchema } from "@vamp-bills/backend/domain/bill/status.ts";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import {
  type AuthedCtx,
  assertApprover,
  assertCreator,
  type BillRow,
  type Bundle,
  type HydratedBill,
  hydrate,
  loadBundle,
  type PaymentRow,
  transitionOrThrow,
} from "./helpers.ts";

// Zod input schemas live here next to the handlers (they're load-bearing for
// the public API contract); routes.ts wires them onto procedures.

export type ListInput = {
  status?: BillStatus | "all";
  scope?: "mine" | "approving" | "all";
};
export const listInputShape = z.object({
  status: billStatusSchema.or(z.literal("all")).optional(),
  scope: z.enum(["mine", "approving", "all"]).optional(),
});

export type CreateInput = z.infer<typeof createInputShape>;
export const createInputShape = insertBillSchema.extend({
  lineItems: z.array(insertLineItemSchema).min(1, "at least one line item is required"),
});

export type UpdateInput = z.infer<typeof updateInputShape>;
export const updateInputShape = insertBillSchema.partial().extend({
  id: z.string().min(1),
  lineItems: z.array(insertLineItemSchema).optional(),
});

export const billIdInputShape = z.object({ id: z.string().min(1) });
export type BillIdInput = z.infer<typeof billIdInputShape>;

// ─── non-lifecycle handlers ────────────────────────────────────────────────

export async function list({ input, ctx }: { input: ListInput | undefined; ctx: AuthedCtx }) {
  const filters = [];
  if (input?.status && input.status !== "all") {
    filters.push(eq(bills.status, input.status));
  }
  if (input?.scope === "mine") {
    filters.push(eq(bills.createdBy, ctx.user.id));
  } else if (input?.scope === "approving") {
    filters.push(eq(bills.approverId, ctx.user.id));
  }
  const where =
    filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : and(...filters);
  return db
    .select({
      id: bills.id,
      status: bills.status,
      invoiceNumber: bills.invoiceNumber,
      totalAmount: bills.totalAmount,
      currency: bills.currency,
      invoiceDate: bills.invoiceDate,
      dueDate: bills.dueDate,
      vendorId: bills.vendorId,
      vendorName: vendors.name,
      createdBy: bills.createdBy,
      approverId: bills.approverId,
      createdAt: bills.createdAt,
      updatedAt: bills.updatedAt,
    })
    .from(bills)
    .leftJoin(vendors, eq(bills.vendorId, vendors.id))
    .where(where)
    .orderBy(desc(bills.createdAt));
}

export async function getById({ input }: { input: BillIdInput }): Promise<HydratedBill> {
  const bundle = await loadBundle(input.id);
  return hydrate(bundle.bill, bundle.lineItems, bundle.payment);
}

export async function create({
  input,
  ctx,
}: {
  input: CreateInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const { lineItems: items, ...billFields } = input;
  const created = await db.transaction(async (tx) => {
    const [billRow] = await tx
      .insert(bills)
      .values({ ...billFields, createdBy: ctx.user.id })
      .returning();
    if (!billRow) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "bill insert returned no row",
      });
    }
    const inserted = await tx
      .insert(billLineItems)
      .values(items.map((li) => ({ ...li, billId: billRow.id })))
      .returning();
    return { bill: billRow, lineItems: inserted };
  });
  return hydrate(created.bill, created.lineItems, null);
}

export async function update({
  input,
  ctx,
}: {
  input: UpdateInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const { id, lineItems: nextItems, ...patch } = input;
  const bundle = await loadBundle(id);
  assertCreator(bundle.bill, ctx.user.id);

  if (bundle.bill.status === "paid" || bundle.bill.status === "archived") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `cannot update a bill in ${bundle.bill.status} state`,
    });
  }

  const mergedItems = nextItems ?? bundle.lineItems;
  const mergedBill: BillRow = { ...bundle.bill, ...patch };

  let nextStatus: BillStatus = bundle.bill.status;
  if (bundle.bill.status === "approved" || bundle.bill.status === "rejected") {
    // Status fires EDIT → awaiting_approval. EDIT is unguarded, so the
    // only failure mode here is wrong_state, which we've ruled out above.
    nextStatus = transitionOrThrow(
      bundle.bill.status,
      { type: "EDIT" },
      { bill: mergedBill, lineItems: mergedItems },
    );
  }

  const updated = await db.transaction(async (tx) => {
    const [billRow] = await tx
      .update(bills)
      .set({ ...patch, status: nextStatus })
      .where(eq(bills.id, id))
      .returning();
    if (!billRow) {
      throw new TRPCError({ code: "NOT_FOUND", message: `bill ${id} not found` });
    }
    let updatedItems = bundle.lineItems;
    if (nextItems !== undefined) {
      await tx.delete(billLineItems).where(eq(billLineItems.billId, id));
      updatedItems = await tx
        .insert(billLineItems)
        .values(nextItems.map((li) => ({ ...li, billId: id })))
        .returning();
    }
    return { bill: billRow, lineItems: updatedItems };
  });

  return hydrate(updated.bill, updated.lineItems, bundle.payment);
}

// ─── lifecycle factory ─────────────────────────────────────────────────────
//
// All seven lifecycle mutations (submit/approve/reject/markPaid/cancelPayment/
// archive/edit) share the same body: load → assert role → transition → write
// status → optional payment side effect → hydrate. The factory below
// parameterizes the three things that vary (event, role, side effect) and
// the routes.ts entries collapse to one declarative line each.
//
// `transitionOrThrow` returns the current status for unguarded self-actions
// like CANCEL_PAYMENT; we skip the bills update when status doesn't change
// so the no-op event is cheap and the intent is explicit.

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type LifecycleSideEffect = (tx: Tx, bundle: Bundle) => Promise<PaymentRow | null>;

export const sideEffects = {
  insertPayment: async (tx, bundle) => {
    const [row] = await tx
      .insert(payments)
      .values({
        billId: bundle.bill.id,
        amount: bundle.bill.totalAmount,
        status: "paid",
        paidAt: new Date(),
      })
      .returning();
    if (!row) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "payment insert returned no row",
      });
    }
    return row;
  },
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
      if (nextStatus !== bundle.bill.status) {
        const [row] = await tx
          .update(bills)
          .set({ status: nextStatus })
          .where(eq(bills.id, input.id))
          .returning();
        if (!row) {
          throw new TRPCError({ code: "NOT_FOUND", message: `bill ${input.id} not found` });
        }
        updatedBill = row;
      }
      const payment = sideEffect ? await sideEffect(tx, bundle) : bundle.payment;
      return { bill: updatedBill, payment };
    });

    return hydrate(result.bill, bundle.lineItems, result.payment);
  };
}

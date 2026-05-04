import { TRPCError } from "@trpc/server";
import { billLineItems, bills, payments, vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { insertBillSchema, insertLineItemSchema } from "@vamp-bills/backend/domain/bill/schemas.ts";
import { type BillStatus, billStatusSchema } from "@vamp-bills/backend/domain/bill/status.ts";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import {
  type AuthedCtx,
  assertApprover,
  assertCreator,
  type BillRow,
  type HydratedBill,
  hydrate,
  loadBundle,
  transitionOrThrow,
} from "./helpers.ts";

// Zod input schemas live in `routes.ts` (public API contract). The inferred
// types are imported here so handlers stay strongly typed without owning
// the schema definitions.

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

// ─── handlers ──────────────────────────────────────────────────────────────

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

// ─── lifecycle handlers (one per BillEvent) ────────────────────────────────

export async function submit({
  input,
  ctx,
}: {
  input: BillIdInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const bundle = await loadBundle(input.id);
  assertCreator(bundle.bill, ctx.user.id);
  const nextStatus = transitionOrThrow(bundle.bill.status, { type: "SUBMIT" }, bundle);
  const [updated] = await db
    .update(bills)
    .set({ status: nextStatus })
    .where(eq(bills.id, input.id))
    .returning();
  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND", message: `bill ${input.id} not found` });
  }
  return hydrate(updated, bundle.lineItems, bundle.payment);
}

export async function approve({
  input,
  ctx,
}: {
  input: BillIdInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const bundle = await loadBundle(input.id);
  assertApprover(bundle.bill, ctx.user.id);
  const nextStatus = transitionOrThrow(bundle.bill.status, { type: "APPROVE" }, bundle);
  const [updated] = await db
    .update(bills)
    .set({ status: nextStatus })
    .where(eq(bills.id, input.id))
    .returning();
  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND", message: `bill ${input.id} not found` });
  }
  return hydrate(updated, bundle.lineItems, bundle.payment);
}

export async function reject({
  input,
  ctx,
}: {
  input: BillIdInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const bundle = await loadBundle(input.id);
  assertApprover(bundle.bill, ctx.user.id);
  const nextStatus = transitionOrThrow(bundle.bill.status, { type: "REJECT" }, bundle);
  const [updated] = await db
    .update(bills)
    .set({ status: nextStatus })
    .where(eq(bills.id, input.id))
    .returning();
  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND", message: `bill ${input.id} not found` });
  }
  return hydrate(updated, bundle.lineItems, bundle.payment);
}

export async function markPaid({
  input,
  ctx,
}: {
  input: BillIdInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const bundle = await loadBundle(input.id);
  assertCreator(bundle.bill, ctx.user.id);
  const nextStatus = transitionOrThrow(bundle.bill.status, { type: "MARK_PAID" }, bundle);
  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(bills)
      .set({ status: nextStatus })
      .where(eq(bills.id, input.id))
      .returning();
    if (!updated) {
      throw new TRPCError({ code: "NOT_FOUND", message: `bill ${input.id} not found` });
    }
    const [paymentRow] = await tx
      .insert(payments)
      .values({
        billId: input.id,
        amount: bundle.bill.totalAmount,
        status: "paid",
        paidAt: new Date(),
      })
      .returning();
    if (!paymentRow) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "payment insert returned no row",
      });
    }
    return { bill: updated, payment: paymentRow };
  });
  return hydrate(result.bill, bundle.lineItems, result.payment);
}

export async function cancelPayment({
  input,
  ctx,
}: {
  input: BillIdInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const bundle = await loadBundle(input.id);
  assertCreator(bundle.bill, ctx.user.id);
  // Machine acknowledges this as a self-action — bill stays in approved.
  // The actual side effect is voiding the most-recent pending Payment row.
  transitionOrThrow(bundle.bill.status, { type: "CANCEL_PAYMENT" }, bundle);
  if (!bundle.payment) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "no payment to cancel for this bill",
    });
  }
  const [cancelled] = await db
    .update(payments)
    .set({ status: "cancelled" })
    .where(eq(payments.id, bundle.payment.id))
    .returning();
  return hydrate(bundle.bill, bundle.lineItems, cancelled ?? bundle.payment);
}

export async function archive({
  input,
  ctx,
}: {
  input: BillIdInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const bundle = await loadBundle(input.id);
  assertCreator(bundle.bill, ctx.user.id);
  const nextStatus = transitionOrThrow(bundle.bill.status, { type: "ARCHIVE" }, bundle);
  const [updated] = await db
    .update(bills)
    .set({ status: nextStatus })
    .where(eq(bills.id, input.id))
    .returning();
  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND", message: `bill ${input.id} not found` });
  }
  return hydrate(updated, bundle.lineItems, bundle.payment);
}

export async function edit({
  input,
  ctx,
}: {
  input: BillIdInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  // Standalone EDIT — fires the transition without modifying fields.
  // Useful when the UI surfaces an explicit "request changes again" affordance
  // separate from the field-edit form. Field edits go through `update`.
  const bundle = await loadBundle(input.id);
  assertCreator(bundle.bill, ctx.user.id);
  const nextStatus = transitionOrThrow(bundle.bill.status, { type: "EDIT" }, bundle);
  const [updated] = await db
    .update(bills)
    .set({ status: nextStatus })
    .where(eq(bills.id, input.id))
    .returning();
  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND", message: `bill ${input.id} not found` });
  }
  return hydrate(updated, bundle.lineItems, bundle.payment);
}

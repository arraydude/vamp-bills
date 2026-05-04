import { TRPCError } from "@trpc/server";
import { billLineItems, bills, payments, vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import {
  insertBillSchema,
  insertLineItemSchema,
  missingPaths,
} from "@vamp-bills/backend/domain/bill/schemas.ts";
import { type BillStatus, billStatusSchema } from "@vamp-bills/backend/domain/bill/status.ts";
import {
  attemptTransition,
  availableEvents,
  derivedReadiness,
} from "@vamp-bills/backend/domain/bill/transitions.ts";
import { GuardFailedError } from "@vamp-bills/backend/trpc/errors.ts";
import { protectedProcedure, router } from "@vamp-bills/backend/trpc/trpc.ts";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

// Auth helpers — kept inline rather than middlewares because the bill row
// must be loaded first to know who's the creator/approver. Throws are the
// idiomatic tRPC control flow per the @trpc/server#error-handling skill.
type BillRow = typeof bills.$inferSelect;
function assertCreator(bill: BillRow, userId: string): void {
  if (bill.createdBy !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "only the bill creator can perform this action",
    });
  }
}
function assertApprover(bill: BillRow, userId: string): void {
  if (bill.approverId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "only the bill approver can perform this action",
    });
  }
}

// Hydrated shape returned by `getById` and every lifecycle mutation. Single
// canonical contract so the FE never re-derives availableEvents/missingPaths.
// Built inline (never via createCaller) per the @trpc/server#server-side-calls
// skill — invoking createCaller inside a procedure re-runs middleware and
// re-validates input, which is the wrong pattern.
type HydratedBill = {
  bill: BillRow;
  lineItems: (typeof billLineItems.$inferSelect)[];
  payment: typeof payments.$inferSelect | null;
  availableEvents: ReturnType<typeof availableEvents>;
  missingPaths: string[];
};

function hydrate(
  bill: BillRow,
  lineItems: (typeof billLineItems.$inferSelect)[],
  payment: typeof payments.$inferSelect | null,
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
// are awkward to feed back into the hydrate helper's flat shape — three
// short queries are easier to read and the seed data is small).
async function loadBundle(billId: string): Promise<{
  bill: BillRow;
  lineItems: (typeof billLineItems.$inferSelect)[];
  payment: typeof payments.$inferSelect | null;
}> {
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
// mutation can pass a mix of fresh inputs (from insertLineItemSchema, no
// id/billId/timestamps) and persisted rows. derivedReadiness/missingPaths
// only inspect description/amount/position, so the extra columns on
// persisted rows are ignored anyway.
type ReadinessLineItem = {
  description: string;
  amount: string;
  position: number;
};
function transitionOrThrow(
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

const listInput = z.object({
  status: billStatusSchema.or(z.literal("all")).optional(),
  scope: z.enum(["mine", "approving", "all"]).optional(),
});

const billIdInput = z.object({ id: z.string().min(1) });

const createInput = insertBillSchema.extend({
  lineItems: z.array(insertLineItemSchema).min(1, "at least one line item is required"),
});

// `bills.update` — see plan: atomic edit + EDIT transition when status is
// approved/rejected. lineItems, when present, fully replace the existing set.
const updateInput = insertBillSchema.partial().extend({
  id: z.string().min(1),
  lineItems: z.array(insertLineItemSchema).optional(),
});

export const billsRouter = router({
  list: protectedProcedure.input(listInput.optional()).query(async ({ input, ctx }) => {
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
  }),

  getById: protectedProcedure.input(billIdInput).query(async ({ input }) => {
    const bundle = await loadBundle(input.id);
    return hydrate(bundle.bill, bundle.lineItems, bundle.payment);
  }),

  create: protectedProcedure.input(createInput).mutation(async ({ input, ctx }) => {
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
  }),

  update: protectedProcedure.input(updateInput).mutation(async ({ input, ctx }) => {
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
        {
          bill: mergedBill,
          lineItems: mergedItems,
        },
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
  }),

  submit: protectedProcedure.input(billIdInput).mutation(async ({ input, ctx }) => {
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
  }),

  approve: protectedProcedure.input(billIdInput).mutation(async ({ input, ctx }) => {
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
  }),

  reject: protectedProcedure.input(billIdInput).mutation(async ({ input, ctx }) => {
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
  }),

  markPaid: protectedProcedure.input(billIdInput).mutation(async ({ input, ctx }) => {
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
  }),

  cancelPayment: protectedProcedure.input(billIdInput).mutation(async ({ input, ctx }) => {
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
  }),

  archive: protectedProcedure.input(billIdInput).mutation(async ({ input, ctx }) => {
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
  }),

  edit: protectedProcedure.input(billIdInput).mutation(async ({ input, ctx }) => {
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
  }),
});

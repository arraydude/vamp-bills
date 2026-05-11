import { TRPCError } from "@trpc/server";
import { extractInvoiceFields } from "@vamp-bills/backend/ai/extract-invoice.ts";
import { billLineItems, bills, payments, vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { user } from "@vamp-bills/backend/db/auth-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import type { BillEventType } from "@vamp-bills/backend/domain/bill/events.ts";
import {
  insertBillSchema,
  insertLineItemSchema,
  missingPaths,
} from "@vamp-bills/backend/domain/bill/schemas.ts";
import { type BillStatus, billStatusSchema } from "@vamp-bills/backend/domain/bill/status.ts";
import { derivedReadiness } from "@vamp-bills/backend/domain/bill/transitions.ts";
import { env } from "@vamp-bills/backend/env.ts";
import { GuardFailedError } from "@vamp-bills/backend/trpc/errors.ts";
import { parse } from "csv-parse/sync";
import { and, count, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { z } from "zod";

import {
  type AuthedCtx,
  assertApprover,
  assertApproverExists,
  assertCreator,
  assertVendorExists,
  type BillRow,
  type Bundle,
  fetchApproverName,
  type HydratedBill,
  hydrate,
  loadBundle,
  type PaymentRow,
  transitionOrThrow,
} from "./helpers.ts";

// Zod input schemas live here next to the handlers (they're load-bearing for
// the public API contract); routes.ts wires them onto procedures.

export type ListInput = {
  status?: BillStatus | BillStatus[] | "all";
  scope?: "mine" | "approving" | "all";
};
export const listInputShape = z.object({
  status: z
    .union([billStatusSchema, z.array(billStatusSchema).min(1), z.literal("all")])
    .optional(),
  scope: z.enum(["mine", "approving", "all"]).optional(),
});

export type CreateInput = z.infer<typeof createInputShape>;
export const createInputShape = insertBillSchema.extend({
  lineItems: z.array(insertLineItemSchema).min(1, "at least one line item is required"),
});

export type UpdateInput = z.infer<typeof updateInputShape>;
export const updateInputShape = insertBillSchema
  .partial()
  .extend({
    id: z.string().min(1),
    lineItems: z.array(insertLineItemSchema).optional(),
  })
  // Reject id-only payloads. Without this guard a no-op `bills.update({ id })`
  // call still fires EDIT on an approved/rejected bill (round-tripping it back
  // to awaiting_approval with no actual change). The Zod-level reject keeps
  // the FE error contract uniform — same envelope as any other bad input.
  .superRefine((val, ctx) => {
    const { id: _id, lineItems, ...rest } = val;
    const hasFieldPatch = Object.values(rest).some((v) => v !== undefined);
    if (!hasFieldPatch && lineItems === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "at least one field must be provided to update",
      });
    }
  });

export const billIdInputShape = z.object({ id: z.string().min(1) });
export type BillIdInput = z.infer<typeof billIdInputShape>;

const csvRowSchema = z.object({
  vendor: z.string().trim().min(1, "vendor name is required"),
  invoiceNumber: z.string().trim().min(1, "invoice number is required"),
  description: z.string().trim().min(1, "description is required"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "must be a valid decimal"),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
export type CsvRow = z.infer<typeof csvRowSchema>;

export const createBulkInputShape = z.object({
  rows: z.array(csvRowSchema).min(1, "at least one row is required").max(500),
});
export type CreateBulkInput = z.infer<typeof createBulkInputShape>;

export const importCsvInputShape = z.object({
  csv: z.string().min(1, "CSV content is required"),
  dryRun: z.boolean().optional(),
});
export type ImportCsvInput = z.infer<typeof importCsvInputShape>;

export const markPaidInputShape = billIdInputShape.extend({
  reference: z.string().trim().optional(),
});
export type MarkPaidInput = z.infer<typeof markPaidInputShape>;

export const extractFromInvoiceInputShape = z.object({
  base64: z.string().min(1, "file content is required"),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp", "application/pdf"], {
    message: "unsupported file type — use PNG, JPEG, WebP, or PDF",
  }),
});
export type ExtractFromInvoiceInput = z.infer<typeof extractFromInvoiceInputShape>;

export type BillsSummary = {
  paidTotal: number;
  paidCount: number;
  outstandingTotal: number;
  outstandingCount: number;
  pendingApprovalCount: number;
  overdueTotal: number;
  overdueCount: number;
  avgAmount: number;
  totalCount: number;
};

// ─── non-lifecycle handlers ────────────────────────────────────────────────

export async function summary(): Promise<BillsSummary> {
  const statusRows = await db
    .select({
      status: bills.status,
      total: sql<string>`COALESCE(SUM(${bills.totalAmount}), '0')`,
      billCount: count(),
    })
    .from(bills)
    .groupBy(bills.status);

  const [overdueRow] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${bills.totalAmount}), '0')`,
      billCount: count(),
    })
    .from(bills)
    .where(
      and(
        sql`${bills.dueDate} < CURRENT_DATE`,
        notInArray(bills.status, ["paid", "archived", "draft", "rejected"]),
      ),
    );

  const result: BillsSummary = {
    paidTotal: 0,
    paidCount: 0,
    outstandingTotal: 0,
    outstandingCount: 0,
    pendingApprovalCount: 0,
    overdueTotal: Number(overdueRow?.total ?? 0),
    overdueCount: overdueRow?.billCount ?? 0,
    avgAmount: 0,
    totalCount: 0,
  };

  let totalSum = 0;
  for (const row of statusRows) {
    const amount = Number(row.total);
    result.totalCount += row.billCount;
    totalSum += amount;

    if (row.status === "paid") {
      result.paidTotal = amount;
      result.paidCount = row.billCount;
    } else if (row.status === "awaiting_approval" || row.status === "approved") {
      result.outstandingTotal += amount;
      result.outstandingCount += row.billCount;
      if (row.status === "awaiting_approval") {
        result.pendingApprovalCount = row.billCount;
      }
    }
  }

  result.avgAmount = result.totalCount > 0 ? totalSum / result.totalCount : 0;
  return result;
}

export async function list({ input, ctx }: { input: ListInput | undefined; ctx: AuthedCtx }) {
  const filters = [];
  if (input?.status && input.status !== "all") {
    if (Array.isArray(input.status)) {
      filters.push(inArray(bills.status, input.status));
    } else {
      filters.push(eq(bills.status, input.status));
    }
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
      approverName: user.name,
    })
    .from(bills)
    .leftJoin(vendors, eq(bills.vendorId, vendors.id))
    .leftJoin(user, eq(bills.approverId, user.id))
    .where(where)
    .orderBy(desc(bills.createdAt));
}

export async function getById({
  input,
  ctx,
}: {
  input: BillIdInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const bundle = await loadBundle(input.id);
  return hydrate(bundle.bill, bundle.lineItems, bundle.payment, ctx.user.id, bundle.approverName);
}

export async function create({
  input,
  ctx,
}: {
  input: CreateInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const { lineItems: items, ...billFields } = input;
  // Pre-flight FK existence: turn typo'd ids into 4xx instead of letting the
  // FK constraint surface as a 500 via the production-masking branch in the
  // errorFormatter.
  await assertVendorExists(billFields.vendorId);
  await assertApproverExists(billFields.approverId);
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
  const approverName = await fetchApproverName(billFields.approverId);
  return hydrate(created.bill, created.lineItems, null, ctx.user.id, approverName);
}

function vendorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function createBulk({
  input,
  ctx,
}: {
  input: CreateBulkInput;
  ctx: AuthedCtx;
}): Promise<{ created: number; vendorsCreated: string[] }> {
  const existing = await db.select({ id: vendors.id, name: vendors.name }).from(vendors);
  const vendorMap = new Map(existing.map((v) => [v.name.toLowerCase(), v.id]));

  const seen = new Set<string>();
  const newVendorNames: string[] = [];
  for (const row of input.rows) {
    const key = row.vendor.toLowerCase();
    if (!vendorMap.has(key) && !seen.has(key)) {
      seen.add(key);
      newVendorNames.push(row.vendor);
    }
  }
  let billCount = 0;
  await db.transaction(async (tx) => {
    if (newVendorNames.length > 0) {
      const created = await tx
        .insert(vendors)
        .values(
          newVendorNames.map((name) => ({
            name,
            email: `${vendorSlug(name) || "vendor"}@example.com`,
          })),
        )
        .returning();
      for (const v of created) {
        vendorMap.set(v.name.toLowerCase(), v.id);
      }
    }

    for (const row of input.rows) {
      const vendorId = vendorMap.get(row.vendor.toLowerCase());
      if (!vendorId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `vendor "${row.vendor}" not resolved`,
        });
      }
      const [billRow] = await tx
        .insert(bills)
        .values({
          vendorId,
          approverId: ctx.user.id,
          invoiceNumber: row.invoiceNumber,
          description: row.description,
          totalAmount: row.amount,
          currency: "USD",
          invoiceDate: row.invoiceDate,
          dueDate: row.dueDate ?? null,
          createdBy: ctx.user.id,
        })
        .returning();
      if (!billRow) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "bill insert returned no row",
        });
      }
      await tx.insert(billLineItems).values({
        billId: billRow.id,
        description: row.description,
        amount: row.amount,
        position: 0,
      });
      billCount++;
    }
  });

  return { created: billCount, vendorsCreated: newVendorNames };
}

export async function importCsv({
  input,
  ctx,
}: {
  input: ImportCsvInput;
  ctx: AuthedCtx;
}): Promise<{ rows: CsvRow[] } | { created: number; vendorsCreated: string[] }> {
  const records = parse(input.csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  if (records.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "CSV contains no data rows" });
  }
  if (records.length > 500) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "CSV exceeds 500 row limit" });
  }

  const rows = records.map((r, i) => {
    const result = csvRowSchema.safeParse({
      vendor: r.vendor ?? "",
      invoiceNumber: r.invoice_number ?? "",
      description: r.description ?? "",
      amount: r.amount ?? "",
      invoiceDate: r.invoice_date ?? "",
      dueDate: r.due_date || undefined,
    });
    if (!result.success) {
      const issues = result.error.issues.map((iss) => iss.message).join("; ");
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Row ${i + 2}: ${issues}`,
      });
    }
    return result.data;
  });

  if (input.dryRun) {
    return { rows };
  }

  return createBulk({ input: { rows }, ctx });
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

  // FK pre-flight only when the patch actually changes those columns.
  if (patch.vendorId !== undefined && patch.vendorId !== bundle.bill.vendorId) {
    await assertVendorExists(patch.vendorId);
  }
  if (patch.approverId !== undefined && patch.approverId !== bundle.bill.approverId) {
    await assertApproverExists(patch.approverId);
  }

  const mergedItems = nextItems ?? bundle.lineItems;
  const mergedBill: BillRow = { ...bundle.bill, ...patch };

  // Short-circuit no-change saves: a full-form save where every field equals
  // its current value (common UX pattern — user opens edit form, clicks Save
  // without touching anything) must NOT fire EDIT and bump an approved /
  // rejected bill back to awaiting_approval. The Zod superRefine catches
  // id-only payloads at the input layer; this catches the deeper case where
  // every field is present but unchanged.
  if (!hasActualChange(bundle, patch, nextItems)) {
    return hydrate(bundle.bill, bundle.lineItems, bundle.payment, ctx.user.id, bundle.approverName);
  }

  // Defense-in-depth readiness check on the merged shape: drafts may legally
  // be incomplete (the user is still filling them in), but anything beyond
  // draft must remain ready after the patch — otherwise the next APPROVE
  // would be blocked by the machine guard with no way for the FE to surface
  // *which* fields broke it. Surface the missingPaths via GuardFailedError so
  // the frontend can highlight the offending fields.
  if (bundle.bill.status !== "draft") {
    const readiness = derivedReadiness({ ...mergedBill, lineItems: mergedItems });
    if (!readiness.isReady) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "cannot update bill into a not-ready shape outside draft",
        cause: new GuardFailedError(missingPaths({ ...mergedBill, lineItems: mergedItems })),
      });
    }
  }

  let nextStatus: BillStatus = bundle.bill.status;
  if (bundle.bill.status === "approved" || bundle.bill.status === "rejected") {
    // Status fires EDIT → awaiting_approval. With the readiness check above,
    // the merged bill is guaranteed ready, so the only remaining failure mode
    // is wrong_state (already ruled out by the paid/archived early-return).
    nextStatus = transitionOrThrow(
      bundle.bill.status,
      { type: "EDIT" },
      { bill: mergedBill, lineItems: mergedItems },
    );
  }

  const updated = await db.transaction(async (tx) => {
    // Optimistic lock on (status, updatedAt). Postgres trigger sets
    // updated_at = now() on every UPDATE, so the value read by
    // loadBundle matches exactly — no JS Date precision loss.
    const [billRow] = await tx
      .update(bills)
      .set({ ...patch, status: nextStatus })
      .where(
        and(
          eq(bills.id, id),
          eq(bills.status, bundle.bill.status),
          eq(bills.updatedAt, bundle.bill.updatedAt),
        ),
      )
      .returning();
    if (!billRow) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "bill state changed; reload and retry",
      });
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

  const approverName =
    patch.approverId && patch.approverId !== bundle.bill.approverId
      ? await fetchApproverName(patch.approverId)
      : bundle.approverName;
  return hydrate(updated.bill, updated.lineItems, bundle.payment, ctx.user.id, approverName);
}

// True iff the patch or nextItems actually differ from the loaded bundle.
// Field-level equality only compares keys present in the patch (an omitted
// key means "no change"). Line items compare description/amount/position
// pairwise — the only fields the user can edit. Order matters because
// `position` is a user-controlled column.
function hasActualChange(
  bundle: Bundle,
  patch: Partial<BillRow>,
  nextItems: UpdateInput["lineItems"],
): boolean {
  const fieldsChanged = Object.entries(patch).some(([k, v]) => {
    if (v === undefined) return false;
    return v !== (bundle.bill as Record<string, unknown>)[k];
  });
  if (fieldsChanged) return true;
  if (nextItems === undefined) return false;
  if (nextItems.length !== bundle.lineItems.length) return true;
  return nextItems.some((next, i) => {
    const cur = bundle.lineItems[i];
    if (!cur) return true;
    return (
      cur.description !== next.description ||
      cur.amount !== next.amount ||
      cur.position !== next.position
    );
  });
}

// ─── lifecycle factory ─────────────────────────────────────────────────────
//
// All seven lifecycle mutations (submit/approve/reject/markPaid/cancelPayment/
// archive/edit) share the same body: load → assert role → transition → write
// status (with optimistic lock) → optional payment side effect → hydrate. The
// factory parameterizes the three things that vary (event, role, side effect)
// so the routes.ts entries collapse to one declarative line each.
//
// `transitionOrThrow` may legally return the current status (no XState event
// in this machine is currently a self-action, but defensive: we skip the
// bills update when status doesn't change AND skip the side effect too, so a
// future no-op event can't accidentally run a payment write).

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
        // Optimistic lock on (status, updatedAt). Postgres trigger sets
        // updated_at = now() on every UPDATE — no JS Date precision loss.
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
        // Side effects only fire on a real status transition. Defensive: no
        // current event is a self-action, but tying the side effect to the
        // status change prevents future no-op events from accidentally
        // running a payment write.
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
  assertCreator(bundle.bill, ctx.user.id);
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

// ─── AI invoice extraction ───────────────────────────────────────────────

export type InvoiceExtractionResult = {
  vendorId: string | null;
  vendorName: string;
  invoiceNumber: string;
  description: string;
  invoiceDate: string | null;
  dueDate: string | null;
  totalAmount: string;
  lineItems: Array<{ description: string; amount: string }>;
};

export async function extractFromInvoice({
  input,
}: {
  input: ExtractFromInvoiceInput;
}): Promise<InvoiceExtractionResult> {
  if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "AI extraction is not configured — set GOOGLE_GENERATIVE_AI_API_KEY",
    });
  }

  const extracted = await extractInvoiceFields({
    base64: input.base64,
    mimeType: input.mimeType,
  }).catch((err: unknown) => {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        err instanceof Error
          ? `Invoice extraction failed: ${err.message}`
          : "Invoice extraction failed",
    });
  });

  const allVendors = await db.select({ id: vendors.id, name: vendors.name }).from(vendors);
  const normalizedExtracted = extracted.vendorName.toLowerCase().trim();

  let vendorId: string | null = null;
  const exactMatch = allVendors.find((v) => v.name.toLowerCase().trim() === normalizedExtracted);
  if (exactMatch) {
    vendorId = exactMatch.id;
  } else {
    const fuzzyMatch = allVendors.find((v) => {
      const vNorm = v.name.toLowerCase().trim();
      return vNorm.includes(normalizedExtracted) || normalizedExtracted.includes(vNorm);
    });
    if (fuzzyMatch) vendorId = fuzzyMatch.id;
  }

  return {
    vendorId,
    vendorName: extracted.vendorName,
    invoiceNumber: extracted.invoiceNumber,
    description: extracted.description,
    invoiceDate: extracted.invoiceDate,
    dueDate: extracted.dueDate,
    totalAmount: extracted.totalAmount,
    lineItems: extracted.lineItems.map((li) => ({
      description: li.description,
      amount: li.amount,
    })),
  };
}

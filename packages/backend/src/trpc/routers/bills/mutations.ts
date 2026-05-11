import { TRPCError } from "@trpc/server";
import { billLineItems, bills, vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { missingPaths } from "@vamp-bills/backend/domain/bill/schemas.ts";
import type { BillStatus } from "@vamp-bills/backend/domain/bill/status.ts";
import { derivedReadiness } from "@vamp-bills/backend/domain/bill/transitions.ts";
import { GuardFailedError } from "@vamp-bills/backend/trpc/errors.ts";
import { parse } from "csv-parse/sync";
import { and, eq } from "drizzle-orm";

import {
  assertApproverExists,
  assertCreator,
  assertVendorExists,
  fetchApproverName,
  hydrate,
  loadBundle,
  transitionOrThrow,
} from "./helpers";
import type { CreateBulkInput, CreateInput, CsvRow, ImportCsvInput, UpdateInput } from "./schemas";
import { csvRowSchema } from "./schemas";
import type { AuthedCtx, BillRow, Bundle, HydratedBill } from "./types";

export async function create({
  input,
  ctx,
}: {
  input: CreateInput;
  ctx: AuthedCtx;
}): Promise<HydratedBill> {
  const { lineItems: items, ...billFields } = input;
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

  if (patch.vendorId !== undefined && patch.vendorId !== bundle.bill.vendorId) {
    await assertVendorExists(patch.vendorId);
  }
  if (patch.approverId !== undefined && patch.approverId !== bundle.bill.approverId) {
    await assertApproverExists(patch.approverId);
  }

  const mergedItems = nextItems ?? bundle.lineItems;
  const mergedBill: BillRow = { ...bundle.bill, ...patch };

  if (!hasActualChange(bundle, patch, nextItems)) {
    return hydrate(bundle.bill, bundle.lineItems, bundle.payment, ctx.user.id, bundle.approverName);
  }

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

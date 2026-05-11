import { bills, vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { user } from "@vamp-bills/backend/db/auth-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { and, count, desc, eq, inArray, notInArray, sql } from "drizzle-orm";

import { hydrate, loadBundle } from "./helpers";
import type { BillIdInput, ListInput } from "./schemas";
import type { AuthedCtx, BillsSummary, HydratedBill } from "./types";

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

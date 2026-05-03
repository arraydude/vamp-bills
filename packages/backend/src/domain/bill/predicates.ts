// Pure predicates over a bill snapshot. Inputs are intentionally typed against
// minimal shapes (not the full Drizzle row) so callers from tests, routers,
// and the eventual UI all use the same surface. Numeric/money fields arrive
// as strings (node-postgres returns `numeric(p,s)` as string — see
// docs/mvp-scope.md "Implementation notes").

export type BillSnapshot = {
  vendorId: string | null;
  invoiceNumber: string | null;
  totalAmount: string | null;
  invoiceDate: string | null;
  description: string | null;
  approverId: string | null;
};

export type LineItemSnapshot = {
  amount: string;
};

export type MissingField =
  | "vendor"
  | "invoice_number"
  | "total_amount"
  | "invoice_date"
  | "description"
  | "approver"
  | "line_items"
  | "totals_reconcile";

export function missingFields(bill: BillSnapshot, lineItems: LineItemSnapshot[]): MissingField[] {
  const missing: MissingField[] = [];
  if (!bill.vendorId) missing.push("vendor");
  if (!bill.invoiceNumber?.trim()) missing.push("invoice_number");
  if (!bill.totalAmount) missing.push("total_amount");
  if (!bill.invoiceDate) missing.push("invoice_date");
  if (!bill.description?.trim()) missing.push("description");
  if (!bill.approverId) missing.push("approver");
  if (lineItems.length === 0) missing.push("line_items");
  else if (bill.totalAmount && !sumEquals(bill.totalAmount, lineItems))
    missing.push("totals_reconcile");
  return missing;
}

export function hasRequiredFields(bill: BillSnapshot, lineItems: LineItemSnapshot[]): boolean {
  return missingFields(bill, lineItems).every((f) => f === "totals_reconcile");
}

export function hasReconciledLineItems(bill: BillSnapshot, lineItems: LineItemSnapshot[]): boolean {
  if (!bill.totalAmount || lineItems.length === 0) return false;
  return sumEquals(bill.totalAmount, lineItems);
}

export function isReady(bill: BillSnapshot, lineItems: LineItemSnapshot[]): boolean {
  return missingFields(bill, lineItems).length === 0;
}

// Sum line-item amounts as integer cents to avoid float drift. `numeric(12, 2)`
// from Postgres gives us at most 2 decimal places, so multiplying by 100 is
// safe within Number precision (max ~9 quadrillion cents).
function sumEquals(total: string, lineItems: LineItemSnapshot[]): boolean {
  const totalCents = toCents(total);
  const sumCents = lineItems.reduce((acc, li) => acc + toCents(li.amount), 0);
  return totalCents === sumCents;
}

function toCents(amount: string): number {
  // Accepts "100", "100.5", "100.50". Rejects malformed input by returning NaN
  // — comparison with NaN is always false, so a malformed amount never
  // reconciles. That's the right failure mode here.
  const n = Number(amount);
  if (!Number.isFinite(n)) return Number.NaN;
  return Math.round(n * 100);
}

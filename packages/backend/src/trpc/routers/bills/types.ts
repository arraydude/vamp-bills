import type { billLineItems, bills, payments } from "@vamp-bills/backend/db/app-schema.ts";
import type { availableEvents } from "@vamp-bills/backend/domain/bill/transitions.ts";
import type { Context } from "@vamp-bills/backend/trpc/context.ts";

export type AuthedCtx = Omit<Context, "user"> & { user: NonNullable<Context["user"]> };

export type BillRow = typeof bills.$inferSelect;
export type BillLineItemRow = typeof billLineItems.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;

export type Bundle = {
  bill: BillRow;
  lineItems: BillLineItemRow[];
  payment: PaymentRow | null;
  approverName: string | null;
};

export type HydratedBill = {
  bill: BillRow;
  lineItems: BillLineItemRow[];
  payment: PaymentRow | null;
  availableEvents: ReturnType<typeof availableEvents>;
  missingPaths: string[];
  approverName: string | null;
};

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

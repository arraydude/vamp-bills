import { z } from "zod";

import { billStatusEnum } from "../../db/app-schema.ts";

// Single source of truth: the Drizzle pgEnum's typed value tuple.
// Adding/removing a status requires only one edit in app-schema.ts; everything
// downstream (this type, the Zod schema, the XState machine via parity check)
// follows automatically.
export const BILL_STATUSES = billStatusEnum.enumValues;

export type BillStatus = (typeof BILL_STATUSES)[number];

export const billStatusSchema = z.enum(BILL_STATUSES);

// Display labels for the UI. Keyed by BillStatus so the build fails if a
// new status lands without a label.
export const billStatusLabels: Record<BillStatus, string> = {
  draft: "Draft",
  awaiting_approval: "Awaiting approval",
  approved: "Awaiting payment",
  rejected: "Rejected",
  paid: "Paid",
  archived: "Archived",
};

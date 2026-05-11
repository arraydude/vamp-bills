import { billStatusEnum } from "@vamp-bills/backend/db/app-schema.ts";
import { z } from "zod";

export const BILL_STATUSES = billStatusEnum.enumValues;

export type BillStatus = (typeof BILL_STATUSES)[number];

export const billStatusSchema = z.enum(BILL_STATUSES);

export const billStatusLabels: Record<BillStatus, string> = {
  draft: "Draft",
  awaiting_approval: "Awaiting approval",
  approved: "Awaiting payment",
  rejected: "Rejected",
  paid: "Paid",
  archived: "Archived",
};

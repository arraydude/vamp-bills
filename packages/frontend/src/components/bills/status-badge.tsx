import type { BillStatus } from "@vamp-bills/backend/domain/bill/status.ts";
import { Badge, type badgeVariants } from "@workspace/ui/components/badge";
import type { VariantProps } from "class-variance-authority";

type StatusVariant = VariantProps<typeof badgeVariants>["variant"];

const STATUS_VARIANT: Record<BillStatus, StatusVariant> = {
  draft: "outline",
  awaiting_approval: "secondary",
  approved: "secondary",
  rejected: "destructive",
  paid: "secondary",
  archived: "ghost",
};

const STATUS_LABEL: Record<BillStatus, string> = {
  draft: "Draft",
  awaiting_approval: "Awaiting Approval",
  approved: "Awaiting Payment",
  rejected: "Rejected",
  paid: "Paid",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: BillStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}

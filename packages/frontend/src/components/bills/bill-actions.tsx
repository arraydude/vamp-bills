import { IconAlertTriangle } from "@tabler/icons-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import {
  useApproveBill,
  useArchiveBill,
  useCancelBillPayment,
  useMarkBillPaid,
  useRejectBill,
  useSubmitBill,
} from "@/api/bills/mutations.ts";
import type { HydratedBill } from "@/api/bills/queries.ts";
import { StatusBadge } from "@/components/bills/status-badge.tsx";

type BillActionsProps = {
  bill: HydratedBill;
};

const EVENT_LABEL: Record<string, string> = {
  SUBMIT: "Submit for approval",
  APPROVE: "Approve",
  REJECT: "Reject",
  MARK_PAID: "Mark as paid",
  CANCEL_PAYMENT: "Cancel payment",
  ARCHIVE: "Archive",
};

const EVENT_VARIANT: Record<string, "default" | "outline" | "destructive" | "ghost"> = {
  SUBMIT: "default",
  APPROVE: "default",
  REJECT: "destructive",
  MARK_PAID: "default",
  CANCEL_PAYMENT: "destructive",
  ARCHIVE: "ghost",
};

const EVENT_TO_PROCEDURE: Record<string, string> = {
  SUBMIT: "submit",
  APPROVE: "approve",
  REJECT: "reject",
  MARK_PAID: "markPaid",
  CANCEL_PAYMENT: "cancelPayment",
  ARCHIVE: "archive",
};

export function BillActions({ bill }: BillActionsProps) {
  const billId = bill.bill.id;
  const isSelfApproved = bill.bill.approverId === bill.bill.createdBy;
  const submit = useSubmitBill();
  const approve = useApproveBill();
  const reject = useRejectBill();
  const markPaid = useMarkBillPaid();
  const cancelPayment = useCancelBillPayment();
  const archive = useArchiveBill();

  const mutations: Record<string, { mutate: (input: { id: string }) => void; isPending: boolean }> =
    {
      submit,
      approve,
      reject,
      markPaid,
      cancelPayment,
      archive,
    };

  const anyPending = Object.values(mutations).some((m) => m.isPending);

  const visibleEvents = bill.availableEvents.filter((e) => e !== "EDIT" && e in EVENT_TO_PROCEDURE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </span>
        <StatusBadge status={bill.bill.status} />
        {isSelfApproved && (
          <Badge variant="outline" className="gap-1 text-amber-600">
            <IconAlertTriangle className="size-3" />
            Self-approved
          </Badge>
        )}
      </div>

      {visibleEvents.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Actions
          </span>
          {visibleEvents.map((event) => {
            const procedure = EVENT_TO_PROCEDURE[event];
            if (!procedure) return null;
            const mutation = mutations[procedure];
            if (!mutation) return null;
            return (
              <Button
                key={event}
                variant={EVENT_VARIANT[event] ?? "outline"}
                size="sm"
                className="w-full justify-start"
                disabled={anyPending}
                onClick={() => mutation.mutate({ id: billId })}
              >
                {mutation.isPending ? "Processing..." : (EVENT_LABEL[event] ?? event)}
              </Button>
            );
          })}
        </div>
      )}

      {bill.missingPaths.length > 0 && bill.bill.status === "draft" && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Missing fields
          </span>
          <ul className="text-xs text-muted-foreground">
            {bill.missingPaths.map((path) => (
              <li key={path}>• {path}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

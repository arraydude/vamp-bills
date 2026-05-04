import { IconAlertTriangle } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";

import { StatusBadge } from "@/components/bills/status-badge.tsx";
import { useTRPC } from "@/lib/trpc.ts";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type HydratedBill = RouterOutputs["bills"]["getById"];
type BillEventType = HydratedBill["availableEvents"][number];

type BillActionsProps = {
  bill: HydratedBill;
  onUpdate?: (updated: HydratedBill) => void;
};

const EVENT_LABEL: Record<string, string> = {
  SUBMIT: "Submit for approval",
  APPROVE: "Approve",
  REJECT: "Reject",
  MARK_PAID: "Mark as paid",
  CANCEL_PAYMENT: "Cancel payment",
  ARCHIVE: "Archive",
  EDIT: "Edit",
};

const EVENT_VARIANT: Record<string, "default" | "outline" | "destructive" | "ghost"> = {
  SUBMIT: "default",
  APPROVE: "default",
  REJECT: "destructive",
  MARK_PAID: "default",
  CANCEL_PAYMENT: "destructive",
  ARCHIVE: "ghost",
  EDIT: "outline",
};

const EVENT_TO_PROCEDURE: Record<string, string> = {
  SUBMIT: "submit",
  APPROVE: "approve",
  REJECT: "reject",
  MARK_PAID: "markPaid",
  CANCEL_PAYMENT: "cancelPayment",
  ARCHIVE: "archive",
};

export function BillActions({ bill, onUpdate }: BillActionsProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const billId = bill.bill.id;
  const isSelfApproved = bill.bill.approverId === bill.bill.createdBy;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: trpc.bills.list.queryKey() });
    void queryClient.invalidateQueries({
      queryKey: trpc.bills.getById.queryKey({ id: billId }),
    });
  };

  const submitMutation = useMutation(
    trpc.bills.submit.mutationOptions({
      onSuccess: (data) => {
        invalidate();
        toast.success("Bill submitted for approval");
        onUpdate?.(data);
      },
    }),
  );

  const approveMutation = useMutation(
    trpc.bills.approve.mutationOptions({
      onSuccess: (data) => {
        invalidate();
        toast.success("Bill approved");
        onUpdate?.(data);
      },
    }),
  );

  const rejectMutation = useMutation(
    trpc.bills.reject.mutationOptions({
      onSuccess: (data) => {
        invalidate();
        toast.success("Bill rejected");
        onUpdate?.(data);
      },
    }),
  );

  const markPaidMutation = useMutation(
    trpc.bills.markPaid.mutationOptions({
      onSuccess: (data) => {
        invalidate();
        toast.success("Bill marked as paid");
        onUpdate?.(data);
      },
    }),
  );

  const cancelPaymentMutation = useMutation(
    trpc.bills.cancelPayment.mutationOptions({
      onSuccess: (data) => {
        invalidate();
        toast.success("Payment cancelled");
        onUpdate?.(data);
      },
    }),
  );

  const archiveMutation = useMutation(
    trpc.bills.archive.mutationOptions({
      onSuccess: (data) => {
        invalidate();
        toast.success("Bill archived");
        onUpdate?.(data);
      },
    }),
  );

  const mutations: Record<string, { mutate: (input: { id: string }) => void; isPending: boolean }> =
    {
      submit: submitMutation,
      approve: approveMutation,
      reject: rejectMutation,
      markPaid: markPaidMutation,
      cancelPayment: cancelPaymentMutation,
      archive: archiveMutation,
    };

  const anyPending = Object.values(mutations).some((m) => m.isPending);

  const visibleEvents = bill.availableEvents.filter(
    (e): e is BillEventType => e !== "EDIT" && e in EVENT_TO_PROCEDURE,
  );

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

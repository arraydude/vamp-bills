import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { useEffect, useState } from "react";

import { useMarkBillPaid } from "@/api/bills/mutations.ts";

type MarkPaidDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string;
};

export function MarkPaidDialog({ open, onOpenChange, billId }: MarkPaidDialogProps) {
  const [reference, setReference] = useState("");
  const markPaid = useMarkBillPaid({ onSuccess: () => onOpenChange(false) });

  useEffect(() => {
    if (open) setReference("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Mark as paid</DialogTitle>
          <DialogDescription>
            Add an optional payment reference (e.g. wire confirmation, check number).
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="payment-reference">Reference</FieldLabel>
          <Input
            id="payment-reference"
            placeholder="Wired via Mercury, ref 12345"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={markPaid.isPending}
            onClick={() =>
              markPaid.mutate({ id: billId, reference: reference.trim() || undefined })
            }
          >
            {markPaid.isPending ? "Processing..." : "Mark as paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

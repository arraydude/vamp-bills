import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

import type { ExtractFromInvoiceResult } from "@/api/bills/mutations.ts";
import { InvoiceUpload } from "@/components/bills/invoice-upload.tsx";

type InvoiceUploadDialogProps = {
  onOpenChange: (open: boolean) => void;
  onExtracted: (data: ExtractFromInvoiceResult) => void;
};

export function InvoiceUploadDialog({ onOpenChange, onExtracted }: InvoiceUploadDialogProps) {
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan invoice</DialogTitle>
          <DialogDescription>
            Upload an invoice image or PDF to auto-fill the form.
          </DialogDescription>
        </DialogHeader>
        <InvoiceUpload
          onExtracted={(data) => {
            onOpenChange(false);
            onExtracted(data);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

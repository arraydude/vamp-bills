import { IconFileInvoice } from "@tabler/icons-react";
import { Dropzone } from "@workspace/ui/components/dropzone";
import { Spinner } from "@workspace/ui/components/spinner";
import { toast } from "sonner";

import { type ExtractFromInvoiceResult, useExtractFromInvoice } from "@/api/bills/mutations.ts";

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

type InvoiceUploadProps = {
  onExtracted: (data: ExtractFromInvoiceResult) => void;
  disabled?: boolean;
};

export function InvoiceUpload({ onExtracted, disabled }: InvoiceUploadProps) {
  const extract = useExtractFromInvoice({
    onSuccess: (data) => {
      toast.success("Invoice data extracted");
      onExtracted(data);
    },
  });

  function handleDrop(files: File[]) {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      extract.mutate({
        base64,
        mimeType: file.type as "image/png" | "image/jpeg" | "image/webp" | "application/pdf",
      });
    };
    reader.readAsDataURL(file);
  }

  function handleRejected() {
    toast.error("Unsupported file type or file too large (max 10 MB)");
  }

  return (
    <Dropzone
      onDrop={handleDrop}
      onDropRejected={handleRejected}
      accept={ACCEPT}
      maxSize={MAX_SIZE}
      multiple={false}
      disabled={disabled || extract.isPending}
    >
      {extract.isPending ? (
        <>
          <Spinner className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Extracting invoice data…</p>
          <p className="text-xs text-muted-foreground">This usually takes a few seconds</p>
        </>
      ) : (
        <>
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <IconFileInvoice className="size-5" />
          </div>
          <p className="text-sm font-medium">
            Drag & drop an invoice, or{" "}
            <span className="text-primary underline underline-offset-2">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, or PDF — up to 10 MB</p>
        </>
      )}
    </Dropzone>
  );
}

import { IconAlertTriangle, IconUpload } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useState } from "react";

import { useImportCsv, usePreviewCsv } from "@/api/bills/mutations.ts";

type Step = "upload" | "loading" | "preview" | "result";

type PreviewRow = {
  vendor: string;
  invoiceNumber: string;
  description: string;
  amount: string;
  invoiceDate: string;
};

type CsvUploadDialogProps = {
  onOpenChange: (open: boolean) => void;
};

export function CsvUploadDialog({ onOpenChange }: CsvUploadDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [result, setResult] = useState<{ created: number; vendorsCreated: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewCsv = usePreviewCsv({
    onSuccess: (data) => {
      if ("rows" in data) {
        setPreview(data.rows);
        setError(null);
        setStep("preview");
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
      setPreview([]);
      setStep("preview");
    },
  });

  const importCsv = useImportCsv({
    onSuccess: (data) => {
      if ("created" in data) {
        setError(null);
        setResult(data);
        setStep("result");
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Import failed");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are supported");
      setPreview([]);
      setStep("preview");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setStep("loading");
      previewCsv.mutate({ csv: text, dryRun: true });
    };
    reader.readAsText(file);
  };

  const isPending = previewCsv.isPending || importCsv.isPending;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Import CSV"}
            {step === "loading" && "Parsing CSV..."}
            {step === "preview" && "Preview"}
            {step === "result" && "Import Complete"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload a CSV with columns: vendor, invoice_number, description, amount, invoice_date, due_date"}
            {step === "loading" && "Validating your CSV on the server..."}
            {step === "preview" && `${preview.length} row(s) found`}
            {step === "result" && result && (
              <>
                Created {result.created} bill(s).
                {result.vendorsCreated.length > 0 && (
                  <>
                    {" "}
                    Auto-created {result.vendorsCreated.length} vendor(s):{" "}
                    {result.vendorsCreated.join(", ")}
                  </>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <IconUpload className="size-10 text-muted-foreground" />
            <label className="cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              <Button variant="outline" type="button" render={<span />}>
                Choose CSV file
              </Button>
            </label>
          </div>
        )}

        {step === "loading" && (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        )}

        {step === "preview" && (
          <div className="max-h-80 overflow-auto">
            {preview.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row) => (
                    <TableRow key={`${row.vendor}-${row.invoiceNumber}-${row.amount}`}>
                      <TableCell>{row.vendor}</TableCell>
                      <TableCell>{row.invoiceNumber}</TableCell>
                      <TableCell className="max-w-48 truncate">{row.description}</TableCell>
                      <TableCell className="text-right tabular-nums">${row.amount}</TableCell>
                      <TableCell>{row.invoiceDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          {step === "preview" && (
            <>
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setStep("upload");
                  setCsvText("");
                  setPreview([]);
                  setError(null);
                }}
              >
                Back
              </Button>
              <Button
                disabled={preview.length === 0 || isPending}
                onClick={() => importCsv.mutate({ csv: csvText })}
              >
                {importCsv.isPending ? "Creating..." : `Create ${preview.length} bill(s)`}
              </Button>
            </>
          )}
          {step === "result" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

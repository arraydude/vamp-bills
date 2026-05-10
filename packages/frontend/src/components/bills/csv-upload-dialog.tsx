import { IconUpload } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useState } from "react";

import { useImportCsv } from "@/api/bills/mutations.ts";

type Step = "upload" | "preview" | "result";

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

function parsePreview(text: string): PreviewRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const header = lines[0];
  if (!header) return [];
  const headers = header.split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

  const colIndex = Object.fromEntries(headers.map((h, i) => [h, i])) as Record<string, number>;

  return lines.slice(1).map((line) => {
    const fields = line.split(",").map((f) => f.trim());
    return {
      vendor: fields[colIndex.vendor] ?? "",
      invoiceNumber: fields[colIndex.invoice_number] ?? "",
      description: fields[colIndex.description] ?? "",
      amount: fields[colIndex.amount] ?? "",
      invoiceDate: fields[colIndex.invoice_date] ?? "",
    };
  });
}

export function CsvUploadDialog({ onOpenChange }: CsvUploadDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [result, setResult] = useState<{ created: number; vendorsCreated: string[] } | null>(null);

  const importCsv = useImportCsv({
    onSuccess: (data) => {
      setResult(data);
      setStep("result");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setPreview(parsePreview(text));
      setStep("preview");
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Import CSV"}
            {step === "preview" && "Preview"}
            {step === "result" && "Import Complete"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload a CSV with columns: vendor, invoice_number, description, amount, invoice_date, due_date"}
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

        {step === "preview" && (
          <div className="max-h-80 overflow-auto">
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
                  <TableRow key={`${row.vendor}-${row.invoiceNumber}`}>
                    <TableCell>{row.vendor}</TableCell>
                    <TableCell>{row.invoiceNumber}</TableCell>
                    <TableCell className="max-w-48 truncate">{row.description}</TableCell>
                    <TableCell className="text-right tabular-nums">${row.amount}</TableCell>
                    <TableCell>{row.invoiceDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                onClick={() => {
                  setStep("upload");
                  setCsvText("");
                  setPreview([]);
                }}
              >
                Back
              </Button>
              <Button
                disabled={preview.length === 0 || importCsv.isPending}
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

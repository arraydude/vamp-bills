import { TRPCError } from "@trpc/server";
import { vendors } from "@vamp-bills/backend/db/app-schema.ts";
import { db } from "@vamp-bills/backend/db/client.ts";
import { env } from "@vamp-bills/backend/env.ts";

import type { ExtractFromInvoiceInput } from "./schemas";
import type { InvoiceExtractionResult } from "./types";

export async function extractFromInvoice({
  input,
}: {
  input: ExtractFromInvoiceInput;
}): Promise<InvoiceExtractionResult> {
  if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "AI extraction is not configured — set GOOGLE_GENERATIVE_AI_API_KEY",
    });
  }

  const { extractInvoiceFields } = await import("@vamp-bills/backend/ai/extract-invoice.ts");
  const extracted = await extractInvoiceFields({
    base64: input.base64,
    mimeType: input.mimeType,
  }).catch((err: unknown) => {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        err instanceof Error
          ? `Invoice extraction failed: ${err.message}`
          : "Invoice extraction failed",
    });
  });

  const allVendors = await db.select({ id: vendors.id, name: vendors.name }).from(vendors);
  const normalizedExtracted = extracted.vendorName.toLowerCase().trim();

  let vendorId: string | null = null;
  const exactMatch = allVendors.find((v) => v.name.toLowerCase().trim() === normalizedExtracted);
  if (exactMatch) {
    vendorId = exactMatch.id;
  } else {
    const fuzzyMatch = allVendors.find((v) => {
      const vNorm = v.name.toLowerCase().trim();
      return vNorm.includes(normalizedExtracted) || normalizedExtracted.includes(vNorm);
    });
    if (fuzzyMatch) vendorId = fuzzyMatch.id;
  }

  return {
    vendorId,
    vendorName: extracted.vendorName,
    invoiceNumber: extracted.invoiceNumber,
    description: extracted.description,
    invoiceDate: extracted.invoiceDate,
    dueDate: extracted.dueDate,
    totalAmount: extracted.totalAmount,
    lineItems: extracted.lineItems.map((li) => ({
      description: li.description,
      amount: li.amount,
    })),
  };
}

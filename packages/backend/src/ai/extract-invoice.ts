import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

export const invoiceExtractionSchema = z.object({
  vendorName: z.string().describe("The vendor/supplier company name on the invoice"),
  invoiceNumber: z.string().describe("The invoice number or reference ID"),
  description: z.string().describe("A brief description of what the invoice is for"),
  invoiceDate: z
    .string()
    .nullable()
    .describe("The invoice issue date in YYYY-MM-DD format, or null if not found"),
  dueDate: z
    .string()
    .nullable()
    .describe("The payment due date in YYYY-MM-DD format, or null if not found"),
  totalAmount: z
    .string()
    .describe("The total amount as a decimal string with up to 2 decimal places, e.g. '1234.56'"),
  lineItems: z
    .array(
      z.object({
        description: z.string().describe("Description of the line item"),
        amount: z.string().describe("Amount for this line item as a decimal string, e.g. '250.00'"),
      }),
    )
    .describe(
      "Individual line items from the invoice. If none found, return a single item matching the total",
    ),
});

export type InvoiceExtraction = z.infer<typeof invoiceExtractionSchema>;

type ExtractInput = {
  base64: string;
  mimeType: string;
};

function buildContentPart(input: ExtractInput) {
  if (input.mimeType.startsWith("image/")) {
    return { type: "image" as const, image: input.base64 };
  }
  return { type: "file" as const, mediaType: input.mimeType, data: input.base64 };
}

const PROMPT = `Extract all invoice fields from this document.
- For dates, use YYYY-MM-DD format.
- For amounts, use plain decimal strings with exactly 2 decimal places — NO currency symbols, NO commas (e.g. '1234.56' not '$1,234.56').
- If you cannot find individual line items, create a single line item with the total amount.
- For the description, summarize what the invoice is for in a short sentence.`;

export async function extractInvoiceFields(input: ExtractInput): Promise<InvoiceExtraction> {
  const model = google("gemini-2.5-flash");

  const { output } = await generateText({
    model,
    output: Output.object({ schema: invoiceExtractionSchema }),
    messages: [
      {
        role: "user",
        content: [buildContentPart(input), { type: "text", text: PROMPT }],
      },
    ],
  });

  if (!output) {
    throw new Error("Failed to extract invoice data — model returned no structured output");
  }

  const clean = (s: string) => s.replace(/[$,]/g, "").trim();
  return {
    ...output,
    totalAmount: clean(output.totalAmount),
    lineItems: output.lineItems.map((li) => ({ ...li, amount: clean(li.amount) })),
  };
}

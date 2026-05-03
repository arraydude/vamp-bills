# Ramp Bill Pay OCR

Source: https://support.ramp.com/hc/en-us/articles/45686841394579-Ramp-Bill-Pay-OCR

Ramp uses Optical Character Recognition (OCR) to scan and parse invoices, extracting key details and automatically populating draft bills. For Ramp Plus customers, Smart OCR uses AI and historical billing patterns to extract invoice details with greater accuracy, and the auto-coding agent automatically sets accounting fields on each line item.

**Jump to:**

* [Bill Pay OCR overview](#bill-pay-ocr-overview)
* [Smart OCR](#smart-ocr)
  + [Custom instructions](#custom-instructions)
  + [Field source tooltips](#field-source-tooltips)
* [Bill Pay accounting auto-coding agent](#bill-pay-accounting-auto-coding-agent)
  + [Provide agent additional context for coding](#provide-agent-additional-context-for-coding)

## Bill Pay OCR overview

Once a PDF document is added to drafts - either via AP forwarding or via drag & drop, Ramp will begin scanning the document to pull relevant fields found on the invoice. OCR can typically take 30-60 seconds and will extract invoice, vendor, and payment details like vendor name, invoice number, due date, payment account numbers/routing numbers, and much more!

Note that Ramp will only OCR the document that's set as the “Invoice” document for the bill. Ramp won't run the OCR on the additional attachments — i.e. the email or the additional files. Also, Ramp won't re-run the OCR if a file is changed and set as the invoice as OCR is only run once per bill.

## Smart OCR

![plus.svg](/hc/article_attachments/45701301243795)

Smart OCR is Ramp's AI-powered invoice processing. It identifies the vendor on your invoice, references historical invoices from that vendor, and applies any saved custom instructions to extract data more accurately. The system learns from your corrections and improves over time as you process more invoices from each vendor.

Smart OCR extracts and auto-fills bill details (invoice number, date, due date, description), amounts (bill total, invoice currency), and line items (description, amount, quantity, unit price, type, tax rate). Accounting coding fields like GL category, department, and location are handled separately by the [auto-coding agent](#bill-pay-accounting-auto-coding-agent).

### Custom instructions

You can teach Smart OCR how to handle invoices from a specific vendor by saving custom instructions in plain language. For example, you can instruct the system to group shipping and handling into a single line item, or to extract a project code from the invoice description.

To add an instruction, click **Add instructions** at the bottom of the bill form, type your instruction, and save. The instruction applies automatically to future invoices from that vendor. You can also add field-specific instructions by clicking into a bill field and selecting **Add instructions**.

To review saved instructions, click **View instructions** in the bill header. In that panel, you can choose whether an instruction applies to **this vendor** or **all vendors**.

### Field source tooltips

To see how Smart OCR determined a field value, hover over any auto-filled field on the bill. A tooltip shows the source, such as whether the value was extracted from the invoice, learned from past bills, or applied from a saved instruction.

**Note:** Tooltips appear only on fields that have an uploaded invoice backing the bill. If you manually entered a value, the tooltip displays "Manually edited" instead of a source attribution.

## Bill Pay accounting auto-coding agent

![plus.svg](/hc/article_attachments/45701301243795)

Using AI and historical data, Ramp's Bill Pay auto-coding agent will automatically set the accounting fields like GL category, location, department, etc. on the bill and its line items, further streamlining and simplifying drafting a bill. The auto coding agent will asses the line item memo and amount and associate patterns from previous bills to predict coding for the bill at present with high accuracy.

Note, Ramp will only attempt auto-coding on accounting fields that don't have a vendor default preset. To identify how the accounting field was set, simply hover over the field.

![Bill line item with auto-coded accounting fields showing Coded by Ramp tooltip](/hc/article_attachments/45701301249043)

### Provide agent additional context for coding

If there is information beyond the line item memo and the amount that would help drive coding, customers have the option to highlight context from the invoice to assist the agent in selecting the appropriate accounting coding. For example, you may highlight the "ship to address" on the invoice to help drive the location coding on the bill.

To give the auto-coding agent this additional information, begin by clicking into the desired accounting category (e.g. location) and select "add context for automatic coding"

![Location dropdown with Add context for automatic coding option highlighted](/hc/article_attachments/45701324924435)

After highlight the field on the invoice PDF that should inform the auto-coding agent on how to code the bill (e.g. a ship to address) and add the appropriate coding for this specific case (e.g. Boston). If there are historical invoices to reference, Ramp will showcase the previous mappings between that invoice PDF field and the accounting coding on the bill - demonstrating how Ramp will learn mappings over time even if the information changes from invoice to invoice.

Note, the context for the auto-coding agent can be set on a per vendor per accounting field basis. For example, for vendor ABC you can add specific context for the Location accounting field and separately add context for the Department accounting field

![Highlighting invoice fields to provide context for the auto-coding agent](/hc/article_attachments/45702696148755)
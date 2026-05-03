# Creating draft bills on Bill Pay

Source: https://support.ramp.com/hc/en-us/articles/27542443251987-Creating-draft-bills-on-Bill-Pay

## Overview

Ramp makes it easy to upload, draft, and review bills on Bill Pay. Customers can streamline ways to add invoices into Ramp, manage their bill attachments, and even automate their bill data entry with OCR technology.

**Jump to:**

* [Overview](#overview)
* [Uploading invoices](#uploading-invoices)
* [Managing bill attachments and documents](#managing-bill-attachments-and-documents)
  + [Actions on bill attachments](#actions-on-bill-attachments)
  + [Syncing attachments to ERPs](#syncing-attachments-to-erps)
* [Scanning and parsing invoices via OCR](#scanning-and-parsing-invoices-via-ocr)
* [Editing and reviewing bill details](#editing-and-reviewing-bill-details)
  + [Bill creation defaults](#bill-creation-defaults)
* [Copying a draft bill](#copying-a-draft-bill)

## Uploading invoices

Bill Pay offers customers multiple ways to add and upload invoices within Ramp.

* AP forwarding for invoice emails
* CSV / Spreadsheet upload
* Drag-and-drop invoices
* [Internal Invoice via Vendor Network](https://support.ramp.com/hc/en-us/articles/38656284398099)

Read more about uploading invoices in [Uploading invoices and bills on Ramp Bill Pay](https://support.ramp.com/hc/en-us/articles/22179276078739-Uploading-invoices-and-bills-on-Ramp-Bill-Pay). For AP forwarding, Ramp creates draft bills for invoices, creates draft vendor credits for vendor credit memos, attaches relevant supporting documents, and filters out files that are neither invoices nor vendor credits, are not relevant to a draft bill, are exact duplicate files, or cannot be processed. Supported file types include PNG, JPG, JPEG, Excel, CSV, and Word documents, in addition to PDFs. For more detail, see [Bill Pay AP Email Forwarding](https://support.ramp.com/hc/en-us/articles/35659701397395-Bill-Pay-AP-Email-Forwarding).

## Managing bill attachments and documents

Any bill attachments uploaded via drag and drop or added through AP forwarding will appear on the left side of the bill once you click on it. For each bill you'll be able to upload the following documents:

* **Invoice** - the primary invoice file for the bill.
* **Email** - if the bill was created through AP forwarding, Ramp will pull in the email to provide additional context when drafting the bill
* **Files** - any additional supporting documents can be added to the bill manually or attached automatically from the same forwarded email when available

![Draft bill showing invoice, email, and file attachments](/hc/article_attachments/27542443242131)

### Actions on bill attachments

Ramp also allows you to easily perform simple actions on your bill documents:

* **Download** - download the current document you are viewing
* **Set as invoice** - set a document in the files tab as the bill invoice
  + Note that this will be the document that's synced over to your ERP (QBO and Sage Intacct customers only). Read more below
* **Create New**
  + **Bill** - create a new bill from the selected document
  + **Vendor Credit** - create a new vendor credit from the selected document
* **Attach to bill** - add the selected document to another bill in drafts. Note you cannot attach to bills that are beyond the draft stage (e.g. bills in the approvals or payments tab)
* **Delete -** remove the selected document from the bill

![Menu for downloading, attaching, or creating new records from bill documents](/hc/article_attachments/27542395597331)

### Syncing attachments to ERPs

Customers with direct integrations to QuickBooks Online and Sage Intacct will have the invoice PDF synced over to their ERP. If the invoice document is changed or updated, Ramp will re-sync the attachment to the ERP and overwrite the previous document.

Note that while Ramp will sync URL links back to the invoice in Ramp for NetSuite and Xero customers, syncing the PDF attachment is not yet supported for these ERPs.

## Scanning and parsing invoices via OCR

Ramp takes advantage of Optical Character Recognition (OCR) technology to scan and parse invoices, allowing for the extraction of key invoice details and automatic data entry into bills in Ramp.

Once an invoice document is added to drafts - either via AP forwarding or via drag & drop - Ramp will begin scanning the document to pull relevant fields found on the invoice. Specifically, Ramp can extract the following fields if present on the invoice:

* Invoice details
  + Invoice number
  + Invoice receive date
  + Invoice due date
  + Invoice total
  + Invoice line items + description
  + Purchase Order number
* Vendor details
  + Vendor name
  + Vendor contact info (email, phone, address)
* Payment details
  + ACH routing numbers / account numbers
  + Mailing address
  + International wire details

OCR typically takes 30–60 seconds. We recommend waiting until OCR is complete before editing the bill in Ramp since once you edit the bill, Ramp’s OCR will end.

Note that Ramp will only OCR the document that's set as the “Invoice” document for the bill. Ramp won't run the OCR on the additional attachments — i.e. the email or the additional files. Also, Ramp won't re-run the OCR if a file is changed and set as the invoice as OCR is only run once per bill.

## Editing and reviewing bill details

Review and edit the draft bill before submitting it for approval. Typically, the default accounting codes are added to the bill, the payment method and dates are verified, the accounting period is verified, and any necessary edits are made to the approval chain before submission. Ramp enables users to add comments and initiate discussions on draft bills.

![Draft bill review flow before approval submission](/hc/article_attachments/27542395599123)

### Bill creation defaults

Ramp can further streamline bill creation by leveraging default payment terms, default entities, default vendor codings, and remembering previously used payment methods on a bill.

**Default payment terms**

If default payment terms are present on the vendor profile, we will automatically set the due date on the bill according to the formula: Invoice date + vendor payment terms = due date. For example, if the invoice date is 1/1 and the payment terms are 30 days, then we would set the due date to 1/30. Available options include Due on receipt, 7, 10, 15, 30, 45, 60, 90 days, or a custom number of days. To configure net payment terms for a vendor, see [Net payment terms](https://support.ramp.com/hc/en-us/articles/16103495669011-Vendor-management-on-Ramp#net-payment-terms) in Vendor management on Ramp.

This due date will always take precedence over / override the OCR due date in the case of a discrepancy.

**Default entities**  
How we default the entity on the draft depends on how the invoice was ingested.

* (1) If the invoice was sent in via AP forwarding using an entity-specific mailbox (e.g. entity\_1@ap.ramp.com) then we will stamp the draft with the entity listed on the mailbox, even if this conflicts with any default entities set on the vendor
* (2) Otherwise, if the invoice is sent in via AP forwarding using the primary, non entity specific mailbox (e.g. parent\_company@ap.ramp.com) OR the invoice is created through any other channel besides AP forwarding then:
  + If a vendor has a default entity set, then we will default the draft to that default entity
  + Otherwise, if no default entity is set for that vendor, we’ll fall back to the entity used on the last bill paid or created for that vendor.
  + If no prior bills paid, we’ll default to the Primary entity.

Note that only in the case of (2), if the vendor is not automatically set on the invoice via OCR (if it's a new vendor, or Ramp was not able to automatically set it for other reasons), then the invoice will be visible to all users who can view drafts, including those with entity restrictions. This is because the vendor decision dictates the entity selection. Once the vendor is set on the invoice, then the draft will be dictated by entity-specific restrictions in place.

Whereas in the case of (1), the entity will be restricted based on the entity-specific mailbox used, even if the vendor was not set automatically via OCR.

**Vendor default accounting codings**

You can set default codings for a given vendor in their vendor profile within the Vendors tab in Ramp. If a vendor doesn't have default coding set, and a category is applied to a bill for that vendor, this will automatically be saved as the vendor's default accounting. Existing default accounting fields will never be overwritten, this will only be set if the field is empty.

**Vendor default payment method**

Ramp will automatically set the first payment method added to a vendor as the default payment method, but you can update the default at any time. Changing the default payment method allows you to update the payment method on any pending bills. Read more about setting a default payment method [here](https://support.ramp.com/hc/en-us/articles/16103495669011).

**Vendor default entity (Ramp for Multi-Entity customers only)**

Ramp will automatically set the entity of a new bill to match the entity that was used on your most recent bill for that vendor.

If there are no prior bills for us to reference for a vendor, then we will simply match the entity of the most recent bill you created.

## Copying a draft bill

To help streamline bill creation, you can now duplicate any draft bill by selecting **Copy draft bill**. This will create a new draft with the following fields copied over:

* Vendor
* Description
* Invoice
* Currency
* Entity
* Line item amounts and descriptions
* Accounting fields (both at the bill level and line item level)

You can edit the duplicated draft bill before submitting it for approval or payment.
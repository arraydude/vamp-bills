# Bill Pay AP Email Forwarding

Source: https://support.ramp.com/hc/en-us/articles/35659701397395-Bill-Pay-AP-Email-Forwarding

## Overview

Ramp AP email forwarding gives your team a dedicated *@ap.ramp.com* inbox for vendor emails. Ramp reviews supported attachments, creates drafts for invoices and vendor credits, attaches relevant supporting documents, and filters out files that are neither invoices nor vendor credits, are exact duplicate files, or cannot be processed.

Use AP forwarding when you want to turn vendor invoice emails into draft bills without re-uploading files by hand. Looking for other ways to add invoices? See [Uploading invoices and bills on Ramp Bill Pay](https://support.ramp.com/hc/en-us/articles/22179276078739-Uploading-invoices-and-bills-on-Ramp-Bill-Pay).

**Jump to:**

* [Overview](#h_overview)
* [Set up AP email forwarding](#h_set_up_ap_email_forwarding)
* [Which emails can forward to the Ramp AP inbox](#h_which_emails_can_forward)
* [What Ramp creates from forwarded emails](#h_what_ramp_creates)
* [Email notifications](#h_email_notifications)
* [Frequently asked questions](#h_faqs)

## Set up AP email forwarding

### Find your Ramp AP email address

Ramp creates a dedicated AP forwarding address for your business. The format is *<company-name>@ap.ramp.com*. For example, if your business is called Super Fast Inc, your AP email address would be [superfastinc@ap.ramp.com](mailto:superfastinc@ap.ramp.com).

Go to **Bill Pay** > **New Bill** > **Forward invoices to pre-fill drafts**.

![Bill Pay menu showing where to find the company's AP forwarding address](/hc/article_attachments/35659701383059)

### Multi-entity inboxes

If you use Ramp Multi-Entity, you will have an AP inbox for each entity plus a shared cross-entity inbox.

* **Entity-specific address:** Emails sent to an entity-specific inbox create draft bills with that entity preselected.
* **Cross-entity address:** Emails sent to the shared inbox use the vendor's default entity when one is set. If no default entity is set, Ramp uses the most recent entity used for that vendor, then falls back to your primary entity.

![Bill Pay view showing entity-specific and cross-entity AP forwarding inboxes](/hc/article_attachments/45672856263699)

### Manual forwarding and auto-forwarding

You can manually forward individual vendor emails to Ramp or set up automatic forwarding from a shared AP inbox. Auto-forwarding works best for teams that receive invoices and vendor documents in a centralized mailbox.

Ramp automatically verifies forwarding requests, so you no longer need to contact Ramp Support to finish setup.

### Set up auto-forwarding with Google Workspace

1. From the inbox you want to forward from, follow Google's [instructions for email forwarding](https://support.google.com/mail/answer/10957?hl=en).
2. Add your Ramp AP email address as the forwarding destination.
3. Ramp automatically approves the forwarding verification email.
4. Send a test invoice to confirm it creates a draft bill in Ramp.

### Set up auto-forwarding with Microsoft 365 or Outlook

1. Follow Microsoft's [instructions for automatic forwarding](https://support.microsoft.com/en-us/office/turn-on-or-off-automatic-forwarding-in-outlook-com-6246987c-6c8f-4144-b255-14fc07007dad).
2. Add your Ramp AP email address as the forwarding destination.
3. Send a test invoice to confirm it creates a draft bill in Ramp.

## Which emails can forward to the Ramp AP inbox

Ramp only processes forwarded emails when at least one of these conditions is true:

1. **Registered Ramp user:** The sender is a registered Ramp user at your company.
2. **Company domain:** The sender's email domain matches your company domain or a domain used by another registered Ramp user at your company, excluding common public domains.
3. **Vendor contact domain:** The sender's email domain matches a stored vendor contact domain in Ramp.
4. **Matching recipient:** Someone in the **To** field meets one of the conditions above.

If an email does not meet these requirements, Ramp filters it out instead of creating a draft bill.

## What Ramp creates from forwarded emails

Ramp reviews supported attachments from forwarded emails and creates drafts only for documents it identifies as invoices or vendor credits.

* **Supported file types:** PDF, PNG, JPG, JPEG, CSV, Word, and Excel files
* **Drafts:** invoices create draft bills, and vendor credit memos create draft vendor credits
* **Relevant supporting documents:** files that appear related to an invoice in the same forwarded email can be attached to the draft bill for reference
* **Filtered documents:** files that are neither invoices nor vendor credits, are not relevant to a draft bill, or are exact duplicate files are filtered out automatically
* **Unprocessed documents:** unsupported, password-protected, or encrypted files are not processed
* **Spam:** filtered out automatically

Supported file types include PNG, JPG, JPEG, Excel, CSV, and Word documents, in addition to PDFs.

### Bills and vendor credits

If Ramp detects a bill and the forwarded email meets the criteria above, Ramp creates a draft bill in Bill Pay and uses OCR to pre-fill invoice number, due date, total, line items, vendor details, and payment details when possible. Ramp also attaches the forwarded email itself to the draft bill for context. Learn how to review and edit draft bills in [Creating draft bills on Bill Pay](https://support.ramp.com/hc/en-us/articles/27542443251987-Creating-draft-bills-on-Bill-Pay).

If an email includes multiple invoices, Ramp creates a separate draft bill for each invoice it detects. If one attachment contains multiple invoices, add **[Split]** to the email subject line so Ramp creates separate draft bills.

If Ramp detects a vendor credit memo, Ramp creates a draft vendor credit in Bill Pay so you can review it in **Drafts**. Learn more in [Vendor credits / Credit memos on Ramp Bill Pay](https://support.ramp.com/hc/en-us/articles/21321389409683-Vendor-credits-Credit-memos-on-Ramp-Bill-Pay).

If an email includes an invoice plus other vendor documents, Ramp creates the draft bill and automatically attaches documents that seem relevant to that bill for reference. Files that are neither invoices nor vendor credits and are not relevant to a draft bill are filtered out instead of creating a review task.

### Filtered and unprocessed documents

Ramp filters out documents that are neither invoices nor vendor credits, are not relevant to a draft bill, or are exact duplicate files. Ramp also does not process unsupported, password-protected, or encrypted files. These files do not create drafts.

If you expected a file to create a draft bill and it was filtered out, confirm that the sender meets the forwarding requirements above, the file is a supported type, and the file contains an invoice. You can also upload the invoice manually from [**Bill Pay > Drafts**](https://app.ramp.com/bills/drafts).

If you expected a vendor credit to appear in **Drafts**, confirm that the file is a vendor credit memo and meets the forwarding requirements above. You can also create a vendor credit manually in Ramp.

### Duplicate handling

Ramp filters out exact duplicate files automatically by checking the file hash. If a vendor sends an updated file, the hash can differ and the file may still create a draft. In that case, Bill Pay can still flag a potential duplicate invoice when the vendor name and invoice number match an existing bill.

## Email notifications

* **Documents received confirmation:** Ramp replies to the forwarded email with a summary of invoice and vendor credit drafts created, relevant supporting documents attached, and files that were not processed.
* **Files not processed:** The summary can include files Ramp did not process because they were neither invoices nor vendor credits, were not relevant to draft bills, were exact duplicate files, were password-protected or encrypted, or were not supported file types.
* You can turn these emails off in **Settings** > **Personal notifications** > **Bill Pay**.

## Frequently asked questions

**Can vendors send documents directly to my Ramp AP email address?**  
Yes, as long as the email meets Ramp's forwarding rules. Many teams still prefer auto-forwarding from a shared AP inbox so they can review vendor emails before Ramp creates draft bills.

**What happens if I forward a mix of invoices, vendor credits, and other documents?**  
Ramp creates draft bills for invoices and draft vendor credits for vendor credit memos. Related vendor documents can be attached to the bill for reference. Other unrelated documents are filtered out automatically.

**What happens if a forwarded file is not a bill?**  
If Ramp identifies it as a vendor credit memo, Ramp creates a draft vendor credit. Otherwise, Ramp filters it out unless the file appears relevant to an invoice in the same email and can be attached to that draft bill for reference. Spam and duplicate files are filtered out automatically.

**Do I still need Ramp Support to approve forwarding verification emails?**  
No. Ramp automatically verifies forwarding requests when auto-forwarding is enabled.
# Bill lifecycle

Source: https://support.ramp.com/hc/en-us/articles/4417814078611-Bill-Lifecycle

## Overview

Ramp Bill Pay is made with speed and process controls in mind to move your bill from an invoice to paid as efficiently as possible. Use this guide to understand how we make it happen.

**Jump to:**

* [Overview](#overview)
* [Uploading an invoice](#uploading-an-invoice)
* [Bill drafts](#bill-drafts)
* [Approve a bill](#bill-approvals)
* [Pay a bill](#bill-payments)
* [View your paid bills](#viewing-your-paid-bills)
* [Cancel a bill](#cancel-a-bill)
* [Editing a bill](#editing-bills)
* [Reversing or recalling a bill](#reversing-or-recalling-a-bill)
* [Archive a bill](#archiving-bills)

## Uploading an invoice

The first step toward paying most bills is to add an invoice from your vendor to Bill Pay. We provide several options to get started!

**Email your invoice:**

Most invoices end up in your email inbox, so we've created a specific AP email address for you to forward these invoices to! There are a few requirements, but if done correctly, Ramp will automatically create a draft bill for you based on the invoice you've sent over:

1. Make sure you forward invoices from a company email address (e.g. for Ramp, the email would be forwarded from an "@ramp.com" email), from an address associated with any internal user profile on your account, or from an email domain associated with a vendor that's been added to your Ramp instance. Emails sent from external domains not associated with a vendor will not be processed.
2. Supported file types include PNG, JPG, JPEG, Excel, CSV, and Word documents, in addition to PDFs.

The inbox we create for you is, by default, **{{your company name with no spaces}}@ap.ramp.com**. For example, a company named Fast Stuff Inc would have an AP email of [faststuffinc@ap.ramp.com](mailto:faststuffinc@ap.ramp.com) (to customize your AP email, contact our Support team!)

You can also view the email address in your Bill Pay Settings.

We will send an email notification when you send documents into your AP forwarding address to let the sender know what Ramp created and whether any forwarded files could not be processed.

Review advanced configurations in our article on [AP Forwarding](https://support.ramp.com/hc/en-us/articles/22179276078739-Uploading-invoices-and-bills-on-Ramp-Bill-Pay#ap-email-forwarding)

**Manually create a bill**

You can add any invoice file into the [Bills Drafts](https://app.ramp.com/bills/drafts) page by clicking **New bill** in the upper right section of Bill Pay. Drag and drop invoices, or select the specific invoice in your file browser.

Currently, we support invoices in PDF, PNG, or JPG format for uploading via this method.

XML file(s) can be uploaded to the Documents section only, not as the invoice or PO. XML support was added to comply with specific international electronic invoice requirements.

**Bulk upload invoices:**

Ramp also allows you to upload bills in bulk using the import via spreadsheet option:

![Bills page showing the bulk upload option](/hc/article_attachments/31223370839827)

## Bill drafts

Once an invoice has been submitted, we use OCR (computer vision) to extract the invoice number, vendor name, contact information, payment details, and line items for the bill. This information pre-fills into the bill fields lightning fast!

After uploading the invoice and letting OCR work its magic, you can select the drafted bill in the [Bills Draft](https://app.ramp.com/bills/drafts) page and verify we gathered the right information. Once you've confirmed the information is accurate, select your preferred payment method and then click **Continue**. More information about Bill payment methods can be found in our article on [Bill payment methods.](https://support.ramp.com/hc/en-us/articles/4417836454419)

Note that you can optionally add a vendor memo to your bill at this stage. Vendor memos are communicated by email to your vendor.

![Draft bill view with payment method and vendor memo fields](/hc/article_attachments/31223370842899)

## Bill approvals

Bills waiting for approval live in the [For approval](https://app.ramp.com/bill-pay/bills/approvals) section. You can see who is the next approver, send them a reminder once a day, approve bills that require your own review, and if you're an Admin or a Business Owner, skip approvals and pay now.

Bills can also be rejected at this stage. If a bill was rejected by mistake and remains in **Rejected** status, a user with bill modification permissions can open it from **For approval**, click **Edit bill**, make any needed changes, and click **Continue** to submit it back through the approval chain. Bill modification permissions are included in the Admin and Owner roles and can be granted through custom roles — being the bill creator alone is not sufficient. For details, see [Employee Roles and Permissions on Bill Pay](https://support.ramp.com/hc/en-us/articles/42995022042515-Employee-Roles-and-Permissions-on-Bill-Pay). If the bill was archived instead, you will need to re-upload it.

Find more information about approvals in our article on [Bill Pay: Approvals and Accounts Payable roles](https://support.ramp.com/hc/en-us/articles/4417843897747)

![For approval tab showing bills waiting for review](/hc/article_attachments/31223416533523)

## Bill payments

Once a bill is approved, it will move to the [For payment](https://app.ramp.com/bills/scheduled) section where you can see its current status, when it is due, and when the payment will be released. Actions you'll need to take here vary by payment method, but for scheduled bills, you're all set at this stage.

Find information about bill payment methods in our article on [Bill payment methods](https://support.ramp.com/hc/en-us/articles/4417836454419)

## Viewing your paid bills:

All your paid bills are available in the History section.Search them, download them in a .csv, view an invoice, or review details as needed.

With a few easy steps bills move from invoiced to paid!

For info about how to set up recurring bills, please see our article on [Creating and managing recurring bill payments on Ramp's Bill Pay](https://support.ramp.com/hc/en-us/articles/8952397876883-Creating-and-managing-recurring-bill-payments-on-Ramp-s-Bill-Pay)

## Cancel a bill

Only users with Admin access can stop a bill from processing after it has been initiated. (Note: Accounting roles and Accounts Payable roles do not have this option).

* From the **For payment** section of Bill Pay, click the three vertical dots (in the Actions column) on the Bill for which you want to cancel the payment.
* Click **Cancel payment**

You can cancel a bill payment up until the transfer to the vendor is initiated. Once the outbound payment to your vendor has been initiated, the bill can no longer be canceled — even by Support.

If you cancel a payment after funds have already been debited from your bank account, Ramp will return the debited funds to your bank account within approximately 5 business days. Your bill will return to an unscheduled state, and the payment will show as canceled.

**Note:** Do not reinitiate the payment until the refund has posted to your bank account. Reinitiating before the refund arrives may result in a second debit from your account.

If you no longer need the bill after canceling the payment, you can archive it — see [Archiving bills](#archiving-bills) below. Archiving removes the bill from your accounting provider and moves it to History with an **Archived** status.

![Bill actions menu with the cancel bill option](/hc/article_attachments/29802889987347)

## Editing Bills

You can edit a bill at any point by selecting the bill, then clicking **Edit bill**.

When enabled by an admin, **approvers** can also edit most bill fields during the approval process — including descriptions, dates, line items, and accounting fields. Approvers cannot edit the bill total amount, payment details, or vendor. For the full details on approver editing capabilities, see [Employee Roles and Permissions on Bill Pay](https://support.ramp.com/hc/en-us/articles/42995022042515-Employee-Roles-and-Permissions-on-Bill-Pay).

If you edit a bill after it has been approved and synced to your accounting provider, we will update the tracking categories within your accounting provider **as long as the month is still open** in your accounting provider. If your month has been closed, we cannot update the accounting fields.

Please note that some accounting providers have additional limitations on bills that can be edited (for example, Sage Intacct does not allow editing paid bills).

## Reversing or recalling a bill

Ramp does not provide a way to recall a bill, unapprove a bill, or move a bill back to draft status once it has been submitted for approval. After a bill leaves draft, you cannot return it to the Drafts tab.

Instead, use one of the following approaches depending on the bill's current stage:

**If the bill is pending approval**

Ask an approver or Admin to **reject** the bill from [**Bill Pay** > **For approval**](https://app.ramp.com/bill-pay/bills/approvals). After rejection, a user with bill modification permissions (such as an Admin or Owner) can open the bill, make corrections, and click **Edit & re-submit** to send it through the approval workflow again. For details on rejecting and re-submitting bills, see [Rejecting bills](https://support.ramp.com/hc/en-us/articles/4417843897747-Bill-Pay-approvals#rejecting-bills).

**If the bill has been approved but not yet paid**

You can still [edit the bill](#editing-bills) after approval — edits to certain fields will restart the approval chain. See [what changes restart the approval chain](https://support.ramp.com/hc/en-us/articles/4417843897747-Bill-Pay-approvals#frequently-asked-questions-faqs) for the full list. If you no longer need the bill, [archive it](#archiving-bills) instead.

**If the bill has a scheduled or in-flight payment**

[Cancel the payment](#cancel-a-bill) first. After the payment is canceled, the bill returns to an unscheduled state. You can then edit it, reschedule a payment, or archive it. Note that once the outbound payment to the vendor has been initiated, the payment can no longer be canceled.

**If the bill has been paid**

Paid bills cannot be recalled or reversed within Ramp. Contact your vendor directly to arrange a refund or credit if needed.

## Archiving bills

Archiving closes a bill without payment and moves it to the **History** section of **Bill Pay** with an **Archived** status. This action cannot be undone — archived bills cannot be restored to an active state.

Archiving removes the bill from your connected accounting provider, but Ramp preserves these bills in **History** for record-keeping purposes. If you archived a bill by mistake, re-upload the original invoice to [**Bill Pay**](https://app.ramp.com/bills/drafts) to create a new bill.

To archive a bill, any Admin, Owner, or AP Clerk can click the three-dot menu to the right of the bill and click **Archive bill**.

Bills cannot be archived if:

1. The bill payment is processing or has been complete (in-flight payments and paid bills cannot be archived)
2. The bill was paid manually
3. The bill has a pending approval

![Bills list showing archived and paid bill statuses](/hc/article_attachments/31223370846995)
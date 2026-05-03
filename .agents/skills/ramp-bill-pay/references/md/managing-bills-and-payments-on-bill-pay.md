# Managing bills and payments on Bill Pay

Source: https://support.ramp.com/hc/en-us/articles/27579228841875-Managing-bills-and-payments-on-Bill-Pay

## Overview

Managing your bills on Bill Pay just got easier. Use the available filters, sorts, and bulk actions to streamline bill management on Ramp Bill Pay.

**Jump to:**

* [Overview](#overview)
* [Managing bills](#managing-bills)
  + [Bill table views](#bill-table-views)
  + [Bill filters](#bill-filters)
  + [Bill sorts](#bill-sorts)
  + [Bills bulk actions](#bill-bulk-actions)
  + [Archiving a bill](#h_archiving-a-bill)
* [Managing payments](#managing-payments)
  + [Payments table views](#payments-table-views)
  + [Payments filters](#payments-filters)
  + [Payments sorts](#payments-sorts)
  + [Payments bulk actions](#payments-bulk-actions)
* [Exporting bills and payments](#exporting-bills-and-payments)
* [Frequently Asked Questions (FAQs)](#frequently-asked-questions-faqs)

## Managing bills

### Bill table views

Ramp, by default, organizes the [**Bill Pay**](https://app.ramp.com/bills/overview%20) tab by bill stages: Drafts, For Approvals, For Payment, and History (includes Paid and Archived bills). You can easily click through these tabs at the top of the page to view all bills at that stage.

Click the Overview tab to view all bills section based on their status.

![Navigating between Bill Pay sub-tabs: Drafts, Approvals, Payment, History, and Overview](/hc/article_attachments/31521883339795)

*Video of a customer clicking through each Bill Pay sub-tab: Drafts, Approvals, Payment, History, and Overview*

You also have the option to add and remove and re-order the columns within your view.

![Adding, removing, and reordering columns in the Bill Pay table view](/hc/article_attachments/27579221008275)

*Video of customer adding/removing columns and reordering the columns*

If you consistently view a specific set of columns and/or filters, you can save a custom view on your Bill Pay tab.

*![Bill Pay Drafts tab with Save as new view and Options menu for custom views](/hc/article_attachments/31521883345939)*

### Bill filters

Bill Pay gives you the ability to filter bills by several options:

* **Vendor** - view bills for a selected vendor or vendors
* **Vendor owner** - view bills for vendors with selected vendor owner(s)
* **Status** - view bills based on the available statuses from the *Overview* tab
  + **Missing info** - view bills that have been scanned but are missing required info to proceed with bill creation
  + **Ready** - view bills that have all required info and can proceed with bill creation
  + **Awaiting approvals** - view bills in the approval flow
  + **Scheduled** - view bills that have been approved and scheduled for payment
  + **Initiated** - view bill payments that have been initiated
  + **Waiting for match** - view bills that have been approved and waiting for a card transaction match
  + **Ready for payment** - view bills that are approved and selected to be paid off of Ramp
  + **Waiting for vendor** - view bills that have open vendor details requests that have not yet been completed
  + **Unscheduled** - view bills that have been approved but do not have set scheduled payment dates
  + **Payment failed** - view bills that have attempted payment but the payment failed
  + **Paid** - view bills that have completed payment
  + **Archived** - view bills that have been archived (essentially deleted, but kept visible for audit purposes. Bills in this state cannot be hidden or moved to a different state)
  + **Rejected** - view bills that have been rejected from approvals
* **Amount** - view bills between a specified minimum and maximum amount
* **Payment type** - view bills with selected payment types:
  + ACH (direct deposit)
  + International wire (includes both SWIFT USD and FX payments)
  + Check by mail
  + Card
  + Paid off Ramp
* **Next approver** - view bills that are in the approval stage filtered by a specific approver
* **ERP Accounting Fields** - view the accounting codings for the bill. Note, if an accounting field is coded differently across multiple line items, the table view will show "MULTIPLE"
* **Sync status** - view bills with specified sync status
  + Sync successfully
  + Sync in progress
  + Sync failed
* **Entity** - view bills for the specified entity (only available for multi-entity customers)
* **Bill Dates** (Invoice Date, Due Date, Payment send date, Payment arrival date) - view bills based on specified dates
  + Note this filter is found in the top right corner of the Bill Pay table view

|  |  |
| --- | --- |
| Bill Pay filter dropdown showing Vendor, Status, Amount, Payment type, and other options  *Image of the filter drop-down menu options* | Bill dates filter showing Invoice date, Due date, Payment send date, and Payment arrival date  *Image of the bill dates filter and its available options* |

### Bill sorts

You can sort by the following columns in the Bill Pay table's view:

* Vendor/Owner
* Status
* Amount
* Payment, Invoice, and Due Dates
* Invoice #
* Entity

![Sorting columns in the Bill Pay table by clicking column headers](/hc/article_attachments/27579228825619)

*Video of customer sorting columns in Bill Pay tables view*

### Excluding categories

You can choose to exclude specific categories when filtering in the Bill Pay table. To do this, toggle on the "Exclude" option located at the bottom of the filter list.

![Category filter with Exclude toggle enabled to exclude selected categories](/hc/article_attachments/41400870153747)

### Bill bulk actions

Ramp Bill Pay currently supports the following bulk actions.

* **Remind Approvers and Vendors**
* **Edit bills**
  + **amount** - change the total amount on selected bills
  + **due date** - change the due date on selected bills
  + **invoice date** - change the invoice date on selected bills
  + **description** - change the bill description on selected bills
  + **accounting fields** - change any of the accounting fields on selected bills
* **Retry Sync** - retry the bill or bill payment sync for any bills that have associated sync errors
* **Approval Actions**
  + **Approve** - in the For approval tab you may select bills awaiting your approval and bulk approve them
* **Payments actions**
  + **Mark bills as paid** - for bills paid off of Ramp, select bills and mark them as paid
  + **Edit payment date** - add or update the scheduled payment date for bills past the draft stage
  + **Pay now** - initiate payment for selected bills that have been approved
  + **Retry payments** - initiate payment for selected bills that have failed payment.
  + **Unschedule** - remove payment date and unscheduled bills past the draft stage
  + **Cancel** - cancel any initiated payments that have not yet been delivered to the vendor. See [Cancel a bill](https://support.ramp.com/hc/en-us/articles/4417814078611-Bill-lifecycle#cancel-a-bill) for details if funds were already debited from your bank account
* **Delete** - in the Drafts tab, admins may select bills and bulk delete them. Note this permanently deletes the draft bill from Ramp and cannot be undone.

![Selecting multiple bills and using bulk approve action](/hc/article_attachments/27579221023507)

*Video of customer bulk approving bills*

### Archiving a bill

Archiving removes a bill from your active bill queue and your connected accounting provider, and marks it as closed without payment. This action cannot be undone. Archived bills remain visible in the **History** tab for audit purposes but cannot be restored to an active state. If you need to pay a bill that was archived by mistake, re-upload the original invoice to create a new bill.

**Canceling a payment vs. archiving a bill:** Canceling a payment stops an in-flight payment that has not yet been delivered to the vendor. It returns the bill to an unpaid state but leaves it in your active queue. Archiving is a separate action that closes out the bill entirely.

To archive a bill after canceling a payment:

1. Navigate to [**Bill Pay**](https://app.ramp.com/bills).
2. Locate the bill you want to archive.
3. Click the **three-dot menu** (⋮) to the right of the bill and select **Archive bill**.
4. Confirm the action when prompted.

The bill will move to the **History** tab with an **Archived** status.

## Managing payments

![plus.svg](/hc/article_attachments/49030201123731) ![Ramp Beta.svg](/hc/article_attachments/49030206925587)

The **Payments** tab is a dedicated surface within Bill Pay for managing payments, separate from the Bills tab. While the Bills tab focuses on invoice creation and approval, the Payments tab is your central workspace for tracking and actioning on payments after a bill has been fully approved.

Once a bill is fully approved, a **payment object** is created automatically. This payment object represents the actual transfer of funds to the vendor and has its own lifecycle, status, and set of available actions — distinct from the bill itself.

To access the Payments tab, navigate to **Bill Pay > Payments**. Note, this tab is only accessible to Ramp Plus customers.

### Payments table views

The Payments tab organizes payments into views based on the actions you need to take:

* **Overview** — View all of your payments at a glance. Each row represents a payment object, and you can see a mix of statuses.
* **Needs Review** — This is your triage view. It surfaces everything that requires action before a payment can go out, including payments that require release or are missing information.
* **Pending** — View payments that are in motion. This includes ACH transfers in transit, checks that have been mailed, and bills scheduled for payment that will auto-release on their scheduled date. These payments don't need immediate attention but you can monitor their progress here.
* **History** — View all completed and archived payments. You can also download the payment remittance receipt directly from the Actions column.

### Payments filters

The Payments tab provides the following filters to help you find specific payments:

* **Arrival date** — filter by expected payment arrival date
* **Bill due date** — filter by the due date on the linked bill
* **Payment date** — filter by the date the payment was sent or is scheduled to send
* **Vendor** — filter by vendor name
* **Status** — filter by payment status (e.g., ready for release, initiated, scheduled, failed, paid)
* **Amount** — filter by payment amount range
* **Payment method** — filter by payment method (ACH, check, wire, card, etc.)

### Payments sorts

You can sort the Payments table by the following date columns:

* Due date
* Payment date
* Arrival date

### Payments Bulk Actions

The Payments tab supports the following bulk actions on selected payments:

* **Release** — release selected payments that are ready for release
* **Cancel** — cancel selected in-flight payments that have not yet been delivered
* **Edit payment date** — update the scheduled payment date for selected payments
* **Mark as paid** — mark selected payments as paid (for payments made outside of Ramp)
* **Retry** — retry selected payments that have failed
* **Unschedule** — remove the scheduled payment date from selected payments

## Exporting bills and payments

You can export bills and payments from both tabs respectively by clicking the download icon in the top right corner of the page. The following exports are available.

* **Export (CSV)** - exports the list of bills or payments based on the current set of applied filters and columns. **Note**: that draft and archived bills cannot currently be exported
* **Download invoices in bulk (Zip option)** - Users can select the "download invoices (ZIP)" option from the download icon in the bills tables view. After clicking this, an email will be sent with a call-to-action to download the requested files. Only available in bills table view, not the payments table view.
* **Download AP aging report** - learn more about AP aging reports [here](https://support.ramp.com/hc/en-us/articles/4413380587155-Where-to-view-AP-Aging-Report-and-what-s-included). Only available in bills table view, not the payments table view.
* **Advanced Export** - learn more below

![Export dropdown showing Export CSV, Download invoices ZIP, and Export settings options](/hc/article_attachments/49030201130003)

*Image of the Bill Pay export icon and options*

### Advanced Export

Ramp also gives you an advanced export with additional fields. With the advanced export you have access to all columns available in the UI in addition to the following fields:

* Bill URL
* Invoice received date
* Payment method
* Payment initiated date
* Payment received date
* Bill Amount
* Purchase order number
* Currency
* Bill payment sync status
* Entity
* Vendor memo
* Trace ID
* Check number
* Banking partner ID
* Latest approver
* Approvers
* Remote ID

![Advanced export dialog showing column toggles for invoice number, bill URL, vendor, and dates](/hc/article_attachments/32169463011731)

You also have the option to export line item level accounting within the Settings tab.

![Advanced export Settings tab with Include line item accounting toggle enabled](/hc/article_attachments/32169484723859)

## Frequently Asked Questions (FAQs)

**Who has access to these bill table views and the available filters, sorts, and bulk actions?**

* Admin, Owner, and Accounts Payable roles have access to all the Bill Pay tabs (i.e Drafts, Approvals, Payments, History) and all the bills within those tabs.
* Vendor Owners will only have access to the Approvals, Payments and History tab and will only be able to view bills for which they are the vendor owners for. Filters will be adjusted to only display bills accessible to them.
* Individuals on the approval chain will have access to the Approvals tab and will only be able to view bills that require their approval. Filters will be adjusted to only display bills accessible to them. When approver editing is enabled by an admin, approvers can also edit most bill fields during the approval process (except the bill total amount, payment details, and vendor). See [Employee Roles and Permissions on Bill Pay](https://support.ramp.com/hc/en-us/articles/42995022042515-Employee-Roles-and-Permissions-on-Bill-Pay) for details.
* Managers and Employees that are not vendor owners or on the approval chain will not be able to access the Bill Pay tab as a whole.

**Can I recover a deleted draft bill or unarchive an archived bill?**

No. Deleting a draft bill and archiving a bill are both permanent actions that cannot be undone. Ramp does not provide an unarchive or restore option.

* **Deleted draft bills** are permanently removed and cannot be recovered.
* **Archived bills** remain visible in the **History** tab for audit purposes but cannot be moved back to an active state.

If you archived a bill by mistake and still need to pay it, re-upload the original invoice to [**Bill Pay**](https://app.ramp.com/bills/drafts) to create a new bill. See [Uploading an invoice](https://support.ramp.com/hc/en-us/articles/4417814078611-Bill-lifecycle#uploading-an-invoice) for details.

**Can I mark a partial payment as paid on a bill?**

No. The **Mark as paid** action in the Bills and Payments tabs applies to the full bill amount only.

**Who can see the Payments tab?**

Anyone with the **view payment details** permission, including Admins, Owners, and AP Clerks by default.
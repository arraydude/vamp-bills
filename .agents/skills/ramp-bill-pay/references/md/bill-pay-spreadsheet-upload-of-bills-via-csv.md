# Bill Pay spreadsheet upload of bills via CSV

Source: https://support.ramp.com/hc/en-us/articles/33962619829779-Bill-Pay-Spreadsheet-Upload-of-Bills-via-CSV

## Overview

Customers who receive/process invoices via spreadsheet now have a means to upload the spreadsheet (CSV or XLSX) within Ramp and create draft bills.

**Jump to:**

* [Overview](#overview)
* [How to create bills via spreadsheet upload](#how-to-create-bills-via-spreadsheet-upload)
* [Step 1: Begin upload](#step-1-begin-upload)
* [Step 2: Map headers and review upload](#step-2-map-headers-and-review-upload)
* [Step 3: Bulk create draft bills](#step-3-bulk-create-draft-bills)
* [Frequently Asked Questions](#frequently-asked-questions)

## How to create bills via spreadsheet upload

### Step 1: Begin upload

Begin by clicking the New bill button and selecting the “create draft via spreadsheet”

![New bill dropdown with Create bills via spreadsheet option highlighted](/hc/article_attachments/33962619817491)

### Step 2: Map headers and review upload

After uploading your spreadsheet of bills, Ramp will request you review and map your column headers to the fields that Ramp is expecting:

* Vendor Name
  + We'll give you a heads up if this doesn't match with a vendor that has already been created within Ramp!
* Description (optional)
* Invoice #
* Vendor memo (optional)
* Invoice date
* Bill due date
* Business entity (optional - will use default if not specified/only applies for customers using [Ramp Multi-Entity](https://support.ramp.com/hc/en-us/articles/23815251559443-Ramp-support-for-multi-entity-businesses))
* Currency
* Line item description
* Line item amount
* Payment type (optional)
* Bill accounting fields
  + Ramp will pull available accounting fields from both the invoice level and line item level and allow you to code your bills via the spreadsheet upload.

![Mapping spreadsheet column headers to Ramp bill fields during CSV upload](/hc/article_attachments/33962627987091)

### Step 3: Bulk create draft bills

If all the necessary information has been entered for the bill, Admin and Accounts Payable roles can select all their bills and bulk create bills to kickoff approval routing.

![Bill Pay drafts with multiple bills selected and Create bills button in footer](/hc/article_attachments/33962619819667)

### Frequently Asked Questions

1. **How does Ramp schedule bills that are uploaded via bulk bill upload?**Ramp will refer to the schedule preference you have set. If the preference is “Skip for now”, Ramp will not set a payment date. However, if the preference is to schedule, Ramp will set the payment date based on the indicated due date and ensure payment arrives by the due date.
2. **Which roles are able to upload bills via the spreadsheet upload?**Owner, Admin, and Accounts Payable roles can create bills via spreadsheet upload
3. **What if the vendor doesn't exist yet?**If the vendor doesn’t already exist in Ramp, you will need to create the vendor before uploading the bill. For detailed instructions on how to add vendors and assign vendor owners, refer to [this Help Center article.](https://support.ramp.com/hc/en-us/articles/16103495669011-Vendor-management-on-Ramp)
4. **How many bills can we support per bulk action?**   
   Ramp supports up to 100 bills per bulk action.
5. **How to code at the line item level of a bill**  
   Any fields you wish to code at the line item level of a bill will need to be given a per-line classification in your accounting provider. Note that each category must be tracked at the invoice level or per line, and what you see in Ramp is determined by how this is configured in your accounting software. For more information, refer to this Help Center article: [Invoice line items: Expense vs. item](https://support.ramp.com/hc/en-us/articles/10859570893203-Invoice-line-items-Expense-vs-item).
6. **Can I mark bills as paid via an import file?****We do not currently support batching card payments or bill payments marked as "paid outside of Ramp". Read more about [Batch payments on Ramp Bill Pay](https://support.ramp.com/hc/en-us/articles/34235803630867-Batch-payments-on-Ramp-Bill-Pay)**.
# Batch payments on Ramp Bill Pay

Source: https://support.ramp.com/hc/en-us/articles/34235803630867-Batch-payments-on-Ramp-Bill-Pay

![Ramp Plus badge](/hc/article_attachments/34235900924051)

This feature is available to Ramp Plus customers. Interested? Please contact your Account Manager or email sales@ramp.com.

There's way more—check [here](https://ramp.com/pricing) for the complete list of features.

## Overview

The Batch Payments feature allows you to streamline your payment process by paying multiple bills to a single vendor in one transaction, rather than handling each bill separately. This is particularly useful for businesses managing a large volume of invoices, helping you and your vendors save time and simplify reconciliation.

Please note, payments are batched on a **per vendor** basis. Ramp cannot batch a payment across multiple vendors (e.g. a single debit and multiple credits).

The following payment methods can be batched: ACH, Check, SWIFT, and International and Domestic Wires. We do not currently support batching card payments, or payments marked as "paid outside of Ramp."

Jump to:

* [Overview](#overview)
* [Auto-batching set up](#auto-batching-set-up)
  + [Vendor filters](#vendor-filter)
* [How bills are batched](#how-bills-are-batched)
  + [Batching limits](#batching-limits)
  + [Viewing and reviewing batched bills](#viewing-and-reviewing-batched-bills)
* [Batch payment remittance - how payers and vendors reconcile batch payments](#batch-payment-remittance-how-payers-and-vendors-reconcile-batch-payments)
* [Batch payment accounting](#batch-payment-accounting)

## Auto-batching set up

Auto-batching can be enabled from the Bill Pay settings, under the Payments tab

![Bill Pay settings with auto-batch bill payments toggle enabled and applied to all vendors](/hc/article_attachments/43977864845971)

### Vendor Filter

By default, auto-batching will be turned on for all vendors. However, if there is a preference to include or exclude specific vendors, you can do so by setting a vendor filter for auto-batching within Bill Pay settings.

![Vendor filter dialog for auto-batching with option to exclude specific vendors](/hc/article_attachments/43977864849811)

## How bills are batched

With automatic batching, Ramp will automatically group together bills into one combined batch payment if they are going to the same vendor, with the same payment date and payment details (method, timelines, source/destination accounts). Please note, a bill cannot be added to a batch if either the bill or the batch has initiated payment

* For customers who are using our [Payment Release approval feature](https://support.ramp.com/hc/en-us/articles/34648566601235-Bill-Pay-payment-release), bills will be batched after payment release, and upon any updates made to bills post-release.
* For customers who are ***not*** using our Payment Release feature, bills will be batched after bill approval, and upon any updates made to bills post-approval.

### Batching limits

* Up to 500 bills can be included in a single batch
* There is a 1 million USD cap per batch across all payment methods with the exception of International wire, which ranges by currency.

Eligible bills that exceed batch limits will automatically spill over to the next batch.

* For example, if there are 502 eligible bills for a batch, we will automatically batch the first 500 into a batch and then group the remaining 2 into another batch.
* Similarly, if you have 3 bills of $500K each to the same vendor on the same day, Ramp will create 2 batch payments, the first one of $1M with 2 bills and the second one of $500K with the 3rd bill, so as not to go over the $1M limit per payment.

### Viewing and reviewing batched bills

**From the Bill Pay table**

In the "For payment" and the "History" tab, bills can be grouped by "batch" to help in visualizing which bills will be batched together for payment

|  |  |
| --- | --- |
| Group by dropdown menu in Bill Pay table with Batch option highlighted |  |

**From the individual bill**

Clicking into a bill that is batched will show a link the batch bill group which will give overview of the batch payment and the list of bills included in the batch.

![Bill payment status bar showing ACH initiated with link to 6 other batched bills](/hc/article_attachments/43977830594451)![Batch payment drawer showing total amount, payment details, and list of bills in the batch](/hc/article_attachments/43977830601107)

If a batch payment is scheduled, **it can be un-batched by canceling the scheduled payment** via the Batch Payment drawer.

## Batch payment remittance - how payers and vendors reconcile batch payments

### Emails

Once the batch payment is initiated, the bill creator and the default vendor contact will be notified of payment initiation via email. Once the payment is delivered, the bill creator and default vendor contact will be notified again.

**Both the initiated and delivery emails will contain a list of invoices included in the batch payment**, including invoice numbers, as well as tracking information to locate payment in the recipient's account (e.g. bank trace IDs for ACH payments or check number for check payments).

|  |  |
| --- | --- |
| Email to the bill creator on payment initiation | Email to the vendor payment initiation |
| Batch payment initiation email to bill creator showing payment details and included bills | Batch payment initiation email to vendor showing payment details and included bills |

### Payment ID

We generate a unique ID called a Payment ID for every bill payment, including one Payment ID per batch payment. The emails to both bill creator and vendor contact contain this unique Payment ID. This Payment ID can be used to reconcile against all bills included in the payment, if needed.

Payers can find the Payment ID at the top of the batch payment drawer (accessible by clicking the "Batched with # other bills” hyperlink that can be found on any bill that's been batched.)

You can also search by Payment ID in the bill's table.

![Batch payment drawer showing Payment ID, check mailed status, and payment method details](/hc/article_attachments/37741601994131)

### ACH and Check Memos

For ACH payments, we will include the following message in your and your vendor's bank feeds. We do not include invoice #s due to the 80 character limit.

* Your bank feed: {**Payment ID**} {Vendor name} Payment for X bills
* Your vendor's bank feed: {**Payment ID**} {Your business name} Payment for X bills

For check payments, we will include the following message on the check memo to the vendor. **We will list as many invoice numbers as possible up to the 400 character limit**. Note that if you've populated individual check memos on each bill, this will get over-written by the check memo we generate on the batch payment.

* {**Payment ID**} {Your business name} Payment for X bills / Invoice Numbers

## Batch payment accounting

Once we've initiated a debit for the batch payment, we'll sync the batch payment to your accounting system and each bill included in the batch will be updated to Paid.

Below is a screenshot of an example of how a batch payment will be represented in Xero. In the example, 2 bills to the vendor "Xero Vendor" of $55 and $100 were paid with a single batch payment of $155.

![Xero batch payment transaction showing two bills totaling $155 paid to a single vendor](/hc/article_attachments/34236058370579)
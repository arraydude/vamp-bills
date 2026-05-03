# Partial payments on Ramp Bill Pay

Source: https://support.ramp.com/hc/en-us/articles/49845051950739-Partial-payments-on-Ramp-Bill-Pay

![Ramp Beta.svg](/hc/article_attachments/49845067148051)

## Overview

Partial payments let you split a single bill into multiple payments so you can pay an invoice over time instead of all at once. During beta, you can create up to 12 payments on one bill, track the remaining balance, and manage each payment separately in Ramp Bill Pay.

Partial payments are currently available to 20% of beta customers and will roll out to 100% of beta customers by late March. If you want early access, you can turn on partial payments from **Settings > Early Access** in Bill Pay.

During beta, partial payments are available for standard Bill Pay bills. Draft bills and recurring bills are not currently supported.

**Jump to:**

* [Overview](#h_overview)
* [How partial payments work](#h_how_partial_payments_work)
* [How partial payments appear in Ramp](#h_how_partial_payments_appear_in_ramp)
* [Create and manage partial payments](#h_create_and_manage_partial_payments)
* [Editing and release](#h_editing_and_release)
* [Emails](#h_emails)
* [Beta scope](#h_beta_scope)
* [Frequently asked questions](#h_faqs)

## How partial payments work

* Split one bill into up to 12 payments.
* Schedule the first payment and leave the remaining amount unscheduled, or schedule multiple payments in advance.
* Track the remaining balance on the bill separately from the total bill amount.
* View each partial payment as its own payment in the Payments table.
* Once all partial payments are completed, the bill status updates to **Paid**.

## How partial payments appear in Ramp

* In the **Bills** table, Ramp shows the amount remaining while a bill is only partially paid.
* In the bill details view, Ramp shows a payment summary for the bill and lets you open the linked payments.
* In **Bill Pay > Payments**, each partial payment appears as its own payment record so you can track payment-level status and actions.

![Bill details view showing two partial payments, with one paid and one awaiting release, plus the remaining amount.](/hc/article_attachments/49845076881171)

*Bill details view with one partial payment paid and the next partial payment awaiting release*

## Create and manage partial payments

1. Open the bill you want to pay in Bill Pay.
2. In the payment section, click **Split payment** or **Add split**.
3. Enter the amount for each payment. Ramp tracks the remaining balance as you go.
4. Set payment dates for any payments you want to schedule now. You can leave later payments unscheduled and return to them later.
5. Review the payment details for each payment and save your changes.
6. Manage each partial payment from the bill or the Payments tab until it is initiated.

![Bill payment details view showing the Add split button and two scheduled partial payments.](/hc/article_attachments/49845052056595)

*Creating two partial payments from the bill payment details view*

For supported payment rails and timing expectations, see [Bill payment methods and timelines](https://support.ramp.com/hc/en-us/articles/4417836454419-Bill-payment-methods-and-timelines).

## Editing and release

* You can edit an individual partial payment until it is initiated.
* Once the first payment is initiated or completed, you can no longer change the vendor, the total bill amount, or the payment details on the initiated payment.
* If the first payment fails, those fields can be edited again.
* If your business uses payment release, partial payments are eligible for payment release and are released individually. To learn more, see [Bill Pay payment release](https://support.ramp.com/hc/en-us/articles/34648566601235-Bill-Pay-payment-release).
* Bills with partial payments must be reviewed individually for release. Some bill-level bulk actions are not available for bills with partial payments.

## Emails

For partial payments, Ramp sends the vendor's payment notification from **communications@ramp.com** to the vendor's default contact email. If the vendor is enrolled in Ramp Vendor Portal, the notification goes to their portal account email instead. To change which email address receives these notifications, update the default contact email on the vendor's profile (or the portal email for Vendor Portal vendors). For more information about vendor notifications, see [Bill payment methods and timelines](https://support.ramp.com/hc/en-us/articles/4417836454419-Bill-payment-methods-and-timelines#h_vendor-remittance-emails).

The email shows the full invoice total and lists each split payment separately so the vendor can see what has already been paid and what is still scheduled. Completed payments are labeled **Completed** and can include details such as the payment amount, payment type, payment date, estimated arrival date, and Payment ID. Upcoming payments stay listed below the completed payment with their payment amounts and payment types.

![Vendor payment email for a bill with three partial payments](/hc/article_attachments/50301991973523)

*Vendor payment email for a bill with three partial payments*

## Beta scope

### Supported in beta

* Up to 12 payments on a single bill
* ACH, check, and domestic wire payments
* Leaving later payments unscheduled
* Multiple partial payments on the same bill scheduled for the same date
* Separate payment records for each partial payment in the Payments table
* Remaining balance tracking in the Bills table

### ERP support

* Currently supported: QuickBooks and NetSuite
* Expected by the end of March: Sage and Xero

### Not supported yet

* Vendor credits on bills with partial payments
* Draft bills
* Recurring bills
* FX payments
* Manual payments
* Card payments
* Mixed payment methods within the same bill
* Batch payments for partial payments

## Frequently asked questions

**Can I schedule only one payment and add the rest later?**

Yes. You can schedule the first payment and leave the remaining amount unscheduled until you are ready to add more payments.

**Can multiple partial payments on the same bill use the same payment date?**

Yes. Multiple partial payments on the same bill can be scheduled for the same date.

**Can I edit a partial payment after I create it?**

Yes. You can edit a partial payment until it is initiated.

**How do I view the payments after I split the bill?**

You can open the bill to view its payment summary, or go to **Bill Pay > Payments** to view each partial payment as a separate payment record.

**Can I change the bill after the first payment is initiated?**

During beta, once the first payment is initiated or completed, you can no longer change the vendor, the total bill amount, or the payment details on the initiated payment. If the first payment fails, you can edit those fields again.

**Can I bulk release bills with partial payments?**

No. Bills with partial payments must be reviewed individually for release during beta.

**Which accounting providers support partial payments today?**

Partial payments currently support QuickBooks and NetSuite. Sage and Xero are expected by the end of March.

**How do I get access to partial payments?**

Partial payments are currently available to 20% of beta customers and will be available to 100% of beta customers by late March. If your business wants early access, you can turn the feature on from **Settings > Early Access** in Bill Pay.

**Can I use different payment methods on the same bill?**

No. During beta, all partial payments on the same bill must use the same payment method.

**Can I use vendor credits with partial payments?**

No. During beta, vendor credits are not supported on bills with partial payments. To learn more about vendor credits for standard bill flows, see [Vendor credits / Credit memos on Ramp Bill Pay](https://support.ramp.com/hc/en-us/articles/21321389409683-Vendor-credits-Credit-memos-on-Ramp-Bill-Pay).

**Can I use partial payments on recurring bills?**

No. During beta, partial payments are not available for recurring bills.

**What is the difference between partial payments and batch payments?**

Partial payments split one bill into multiple payments over time. Batch payments combine multiple bills for the same vendor into one payment. To learn more, see [Batch payments on Ramp Bill Pay](https://support.ramp.com/hc/en-us/articles/34235803630867-Batch-payments-on-Ramp-Bill-Pay).

**What is the difference between partial payments and recurring bills?**

Partial payments split one existing bill into multiple payments. Recurring bills automatically create future bills on a schedule. To learn more, see [Creating and managing recurring bill payments on Ramp's Bill Pay](https://support.ramp.com/hc/en-us/articles/8952397876883-Creating-and-managing-recurring-bill-payments-on-Ramp-s-Bill-Pay).
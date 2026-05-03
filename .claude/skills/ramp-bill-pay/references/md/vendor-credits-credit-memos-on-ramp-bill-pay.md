# Vendor credits / Credit memos on Ramp Bill Pay

Source: https://support.ramp.com/hc/en-us/articles/21321389409683-Vendor-credits-Credit-memos-on-Ramp-Bill-Pay

## Overview

Vendor credits are credits that you receive from your vendor as an equivalent of the amount that they owe you. With vendor credits, you can track this amount until it is paid by the vendor, refunded, or applied to other bills of the vendor.

Customers can easily track these vendor credits within Ramp and seamlessly apply them to their bills within Bill Pay.

**Jump to:**

* [Overview](#overview)
* [Creating a vendor credit](#creating-a-vendor-credit)
  + [From a paid bill](#from-a-paid-bill)
  + [From the vendor profile](#from-the-vendor-profile)
  + [If you do not see the vendor credit option](#if-you-do-not-see-the-vendor-credit-option)
* [Viewing vendor credits](#viewing-vendor-credits)
* [Applying a vendor credit](#applying-a-vendor-credit)
  + [Vendor credit(s) partially pays for the bill](#vendor-credits-partially-pays-for-the-bill)
  + [Vendor credit(s) fully pays for the bill](#vendor-credit-s-fully-pays-for-the-bill)
* [How Vendor Credits Sync in your accounting provider](#vendor-credit-accounting)
  + [Vendor credit creation sync](#vendor-credit-creation)
  + [Vendor credit application sync](#vendor-credit-application)
* [Frequently Asked Questions](#frequently-asked-questions-faqs)

## Creating a vendor credit

Customers can create a credit memo for a particular vendor by using an existing paid bill in Bill Pay.

### From a paid bill

If a credit memo is issued on a particular bill that has been paid, you can locate that bill within the Paid tab and begin to create a vendor credit from the three dots menu.

![](https://lh4.googleusercontent.com/btg-OLBWX76y6waJg3-7PTZy9xGf99aZGDCmDw-Wyf9KbusqTx0PO2gKq3E7ePW8N_Zerd-0snWTs6wwwGInC_1yaGZb96zEeesFSa25e5nNzEfBba12pNoLPnCFzhlz6wzUmZi_bdq0PhnJzfZDMxc)

After clicking **New Vendor Credit**, a vendor credit form will appear where you can input relevant credit memo information. When creating a vendor credit from an existing paid bill, Ramp will automatically tie the credit to the vendor and the bill the credit was created from. Additionally, Ramp will also pull the line item coding from the linked bill and apply it to the vendor credit. If there are any vendor credit memo attachments, you may optionally upload them to the draft vendor credit.

Once all the vendor credit information has been entered, simply click **Save Vendor Credit** to create the vendor credit. All vendor credits are stored and easily accessible from the vendor’s profile.

![](https://lh3.googleusercontent.com/O1F_BylYh7ASbweCU9b38VN_ZbX1ve4qUcmh6XD3go3qVAFetiOfGMwh3KA8W9fxYzTbV3s2jLycoPmWpkD4wX3_NvE6eXXwvFNi95_SqyI1Y87CPmCeFsZ9lCH2_7VIkemgOROR13badyiD6euRtqY)

### If you do not see the vendor credit option

If you do not see **New Vendor Credit** on a bill, confirm that the bill is already in the **Paid** tab and linked to a vendor. If you do not see **New** > **Vendor credit** on a vendor profile, your role may not include the vendor permissions needed to create a credit from that page.

If neither option appears, confirm that your connected accounting provider is listed in the [Vendor credit accounting](#vendor-credit-accounting) section below. If you still cannot create a vendor credit, ask your Ramp Admin to review your Bill Pay and vendor permissions.

### From the vendor profile

You can also create a vendor credit directly from the vendor’s profile in the Vendor tab. Locate the desired vendor, open their profile, click on New in the top right, then Vendor credit.

From there, you will once again have the opportunity to input all the relevant vendor credit information, such as line item amounts, descriptions, and codings, as well as a link to a reference bill, if desired. If you do link a reference bill, please note that only the paid bills connected to the selected vendor will appear in the dropdown.

Note to create a vendor credit, a vendor name and line item(s) are required. A reference bill or credit memo documents are NOT required fields.

## Viewing vendor credits

All vendor credits are stored on the vendor profile they are associated with. To view a particular vendor credit, navigate to the Vendor tab, locate the desired vendor, and scroll to the vendor credit section.

**Please note:** Vendor credits can also be shown on the [**Bills**](https://app.ramp.com/bills/overview%20) table by hovering over the payment method icon as shown in the screenshot below.

![Vendor credits are displayed, showing $30.00 will be applied for Salesforce approval.](/hc/article_attachments/31472795985171)

## Applying a vendor credit

If a vendor has available vendor credits, Ramp will provide the option to toggle application of the credit(s) on or off for a particular bill. Doing so will deduct the vendor credit amount from the invoice total. Please note that Ramp will apply the oldest credits first and that we only allow applying vendor credits that have synced successfully to your accounting provider (see [Accounting](#vendor-credit-accounting) section below for an example).

![](https://lh4.googleusercontent.com/MKRrD8YQDjSiIfgEeRQDF-SedDV9pkUizI1mcjCVOP7mI997dqpS6CxsjXjB1BHYizcOrSnY4TpCXGFLIFmlPDshoObckzS4NSxlHmzjES6D1-U8haNT7ihAhuHJ8uSUA1yITfF7H6iqlzMaONPSY48)

When applying vendor credits to bills, it is useful to think of them in two scenarios:

### Vendor credit(s) partially pays for the bill

This is the case when the vendor credit(s) totals to an amount less than the invoice total and is able to partially pay for the bill.

For example, the vendor credit is $50, the invoice total is $150, therefore the payment total is $100 since the vendor credit brings the total down by $50 and is fully used up.

### Vendor credit(s) fully pays for the bill

This is the case when the vendor credit(s) totals an amount greater than or equal to the invoice total and the vendor is able to fully pay the bill.

For example, the vendor credit is $50, and the invoice total is $25. Therefore, the payment total is $0 as the vendor credit could cover the full payment amount (and there is still a balance of $25 left on the credit)

Bills where the vendor credit fully pays for the bill do not require a payment method. Additionally, once all approvals are received, the bill will automatically be marked as paid and will be moved to the **Paid** tab in Ramp.

![](https://lh6.googleusercontent.com/had4P9h567GKuV743yX8mzAaChwuqQcUXNYcAGbw3WLN4LO2B_cSAnob7B7hDroInc1OkgZQoAbIh2C625cu0lwXLkqcpsMX73gkgQE0uUBGhVW2-B4ztswUIcgWSMhW1azdrz62v5jOKA0h2hSdjIM)

**Please note:** that once a vendor credit has been applied, it cannot be edited or deleted unless the bills it is connected to are deleted or have the vendor credit removed from them.

## Vendor credit accounting

Please note vendor credits functionality is supported for the following accounting connections on Ramp:

* QuickBooks Online
* Xero
* NetSuite
* Sage Intacct
* Microsoft Dynamics Finance & Operations
  + Deploy Ramp's latest ISV package to your F&O environment through [lcs.dynamics.com](https://lcs.dynamics.com) before vendor credits can sync.
* Universal CSV ![Ramp Beta.svg](/hc/article_attachments/48477472960403)
* Dev API

### Direct Integration syncing

For accounting providers connected via direct integration (for example, QuickBooks Online, NetSuite, Xero, Sage Intacct, and Microsoft Dynamics Finance & Operations), there are two accounting syncs to consider with vendor credits.

1. Vendor credit creation
2. Vendor credit application

### Vendor credit creation

Ramp will automatically sync your vendor credits to your connected accounting software as soon as it is created. The synced vendor credit will be tied to the appropriate vendor and will pull over all the accounting coding information you inputted within Ramp. Any updates to the vendor credit within Ramp will also be reflected in your accounting provider. However, please note that changes to the vendor credit within the accounting provider will NOT be reflected in Ramp and might, in turn, result in accounting sync errors.

Any sync errors must be resolved in order to apply a vendor credit and you'll be notified of this on draft bills for the vendor:  
![Line items section displaying an expense for $50 with a warning about unresolved vendor credit sync errors.](/hc/article_attachments/34917628920723)

### Vendor credit application

If you do apply a vendor credit to a bill in Ramp, Ramp will also automatically apply the vendor credit to the bill created in your accounting provider. This action will happen only once the bill payment has been initiated. For example, if you receive a $100 bill and apply for a $25 vendor credit within Ramp, the bill will initially sync as $100. However, once the bill payment is initiated, the vendor credit will be applied, and the bill payment will sync to your accounting provider, updating the bill amount to $75.

### Universal CSV syncing

![Ramp Beta.svg](/hc/article_attachments/48477472960403)

Ramp supports exporting vendor credits from the Accounting > Bills tab for customers on universal CSV accounting connection.

Details on how to manage and export vendor credits for uCSV connection are [here](https://support.ramp.com/hc/en-us/articles/31817848602131)

## Frequently Asked Questions (FAQs)

**Can I import or upload vendor credits in bulk?**  
No. Ramp does not support CSV or spreadsheet imports for vendor credits. You can create vendor credits one at a time from a paid bill or from a vendor profile. If you forward vendor credit documents to your Ramp AP inbox, Ramp sends them to **Document triage** so your team can review and finish each vendor credit individually. See [Bill Pay AP Email Forwarding](https://support.ramp.com/hc/en-us/articles/35659701397395-Bill-Pay-AP-Email-Forwarding).

**Will Vendors get notified about applied vendor credits?**  
Yes, if a vendor credit has been applied to a bill, then the standard email communications to vendors will be updated to include information that a credit was applied.

**Can you create vendor credits/link vendor credits to unpaid bills**  
That is not possible at this time.

**What happens to a vendor credit once fully applied?**  
Ramp will automatically remove the vendor credit, and it will not be available to be applied to future bills.

**Which currencies are vendor credits supported in?**  
Vendor credits are currently only supported in USD.

**Can you delete a vendor credit from a vendor's profile?**

No, the bill will have to be archived.

**Can you delete a vendor credit that has been applied to a bill?**

No, it can't be deleted and will need to be marked as used.

**Are vendor credits and/or payment discounts supported on imported bills?**  
No, vendor credits and payment discounts are not supported on imported bills at this time. However, if you apply a vendor credit to the bill in your accounting system, the imported bill amount should update. See [Importing bills from your accounting provider](https://support.ramp.com/hc/en-us/articles/33844303915539-Importing-bills-from-your-accounting-provider) for more details.
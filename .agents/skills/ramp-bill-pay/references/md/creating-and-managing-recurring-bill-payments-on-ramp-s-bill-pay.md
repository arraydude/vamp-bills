# Creating and managing recurring bill payments on Ramp's Bill Pay

Source: https://support.ramp.com/hc/en-us/articles/8952397876883-Creating-and-managing-recurring-bill-payments-on-Ramp-s-Bill-Pay

## Overview

Ramp allows you to set up recurring bills for regularly scheduled payments to your vendors. Based on the schedule you set up, these recurring bills will automatically be created, routed for approval, and sent for payment.

**Jump to:**

* [Overview](#overview)
* [Setting up a recurring bill](#setting-up-a-recurring-bill)
* [When/how are bills in a recurring series created?](#when-how-are-bills-in-a-recurring-series-created)
* [Viewing recurring series](#viewing-recurring-series)
* [Editing recurring series](#editing-recurring-series)
* [Editing a specific recurring bill](#editing-a-specific-recurring-bill)
* [Deleting recurring series](#deleting-recurring-series)
* [Deleting a specific recurring bill](#deleting-a-specific-recurring-bill)
* [Frequently Asked Questions (FAQs)](#frequently-asked-questions-faqs)

## Setting up a recurring bill

Follow the steps below to set up a recurring bill series:

1. You have two options to begin recurring bill series creation:
   * Click the **recurring bills** button at the top right corner of the [Bill Pay page](https://app.ramp.com/bills/overview) and click the **new recurring bill** button in the side panel that opens up
   * OR click the three dots menu next to a draft bill and click the **create recurring bill** button
2. Select the vendor you would like to create a recurring series for. Learn more about selecting and creating vendors [here](https://support.ramp.com/hc/en-us/articles/4418793009811).
3. Input an optional invoice number and/or description for the recurring series
   * Invoice numbers for subsequent recurring bills will be automatically created with a suffix (-02, -03, etc.)
4. Enter line items and accounting codings for the recurring bill
   * Each bill in the series will be created with the same line items and accounting codings. You will have the option to modify the line items for the series or for a specific bill at any point.
5. Select the payment method for the recurring series.
   * Note that recurring series are only supported for payments via ACH or check. Recurring series for international wire, card payments, or payments made off of Ramp are not yet supported.
6. Select the **pay from** and **pay to** accounts for the recurring bill
7. Set the payment frequency (e.g. Monthly on the 1st) and the recurring series length (e.g. Ends after 1 year)
   * The payment frequency will determine when your end recipient will receive funds. For example, if you select **Monthly on the 1st**, the recipient will receive funds on the 1st of each month (or the closest business day if the 1st falls on a weekend).
8. Preview the approval chain for approving the recurring series as a whole
9. Toggle on/off whether you would like subsequent bills in a series to require approvals or not.
10. Click **continue**, review the recurring series details, and click **create recurring bill**.

![Setting up a recurring bill series with vendor, payment method, and frequency options](/hc/article_attachments/29329067593235)

## When/how are bills in a recurring series created?

**Note:** The first bill in a recurring series is created and routed for approval immediately when the series is set up, regardless of the payment date. Subsequent bills are created automatically 10 days (for ACH payments) or 15 days (for check payments) before their payment date. For example, if you set your payment frequency to be Monthly on the 1st paid via ACH, Ramp will create each subsequent invoice 10 days before the 1st (i.e. on the 21st/22nd of each month).

Ramp will use the details provided above as the template for future bills in the series – i.e., Ramp will keep the same bill codings, bill payment methods, etc., for future bills unless the series is edited or a specific bill is modified. You will also have the option to modify invoice dates and accounting periods for a given bill once it's created in Ramp.

## Viewing recurring series

You can view all active and completed recurring series by clicking the **Recurring bills** button at the top right corner of the [Bill Pay page](https://app.ramp.com/bills/overview).

Clicking on a specific series will allow you to view its recurring series details and the full list of bills that will be created as part of it.

![Viewing a recurring bill series with list of upcoming scheduled bills](/hc/article_attachments/29329081027347)

## Editing recurring series

Ramp gives you the option to both edit the recurring series or edit specific bills in the series. Follow the steps below to edit a recurring series:

1. Click the **Recurring bills** button at the top of the [Bill Pay page](https://app.ramp.com/bills/overview)
2. Click on the desired recurring series you'd like to modify. Note you may only modify active recurring series
3. Click **edit recurring bill** in the bottom right corner
4. Edit the desired field on the series (e.g. amount, payment method, end date, etc.). Note that you may not modify the bill frequency once a series has been created.
5. Click **review changes** and **update recurring bill** **series** to save the changes

Updates to the series will be applied to future bills that have yet to be created. Changes will **NOT** be applied to any bills that have already been created in Ramp.

## Editing a specific recurring bill

Once a bill from a series has been created in Ramp, you will have the ability to edit and update that specific bill. This can be useful if you need to make changes that apply only to the specific bill and should not be applied to the series as a whole.

Follow the steps below to edit a specific bill from a series.

1. Locate the bill in Ramp one of two ways:
   * Click the **Recurring bills** button, select the relevant recurring series, and click on the desired bill
   * Locate the desired bill in the approvals and/or payments tab
2. Click **Edit bill** in the bottom right corner
3. Edit the desired field on the bill (e.g. amount, payment method, invoice date, etc.)
4. Click **Review changes** and **Update bill** to save the changes
   * Note that certain changes may trigger re-approval based on the approval policy your company has set.

![Editing a single bill within a recurring series to modify its details](/hc/article_attachments/29329426352275)

## Deleting recurring series

Ramp gives you the option to both delete the recurring series or delete specific bills in the series. Follow the steps below to delete a recurring series:

1. Click the **Recurring bills** button at the top of the [Bill Pay page](https://app.ramp.com/bills/overview)
2. Click on the desired recurring series you'd like to delete.
3. Click the 3 dots menu in the bottom right corner and select **Delete recurring bill**

Deleting a series will prevent future bills in the series from being created and scheduled in Ramp. Bills that have already been created, initiated, or paid will remain unaffected and won't be deleted.

![Recurring bill series detail with Delete recurring bill option in three-dots menu](/hc/article_attachments/29329481998611)

## Deleting a specific recurring bill

Follow the steps below to delete a specific recurring bill:

1. Locate the bill in Ramp one of two ways:
   * Click the **Recurring bills** button, select the relevant recurring series, and click on the desired bill
   * Locate the desired bill in the approvals and/or payments tab
2. Click the 3 dots menu in the bottom right corner and select **Archive bill**

This will archive the specific bill. The recurring series and future bills won't be impacted. Ramp will continue to create and schedule bills on the recurring schedule that's been set.

## Frequently Asked Questions (FAQs)

**Who is able to create/edit/delete recurring series?**

Admin and Accounts Payable roles have the ability to create, edit, and delete recurring bills.

**What are the supported frequencies for recurring bills?**

Daily, Weekly, Monthly, Quarterly, Annually.

**Why don't I see my recurring payments in the Recurring Bills section?**

Only bills that were formally set up as a recurring series (using the steps above) appear in the **Recurring Bills** panel. Ramp does not automatically detect recurring payment patterns from individually created bills. If you regularly pay the same vendor on a schedule but haven't set up a recurring series, those bills will appear as individual bills in your standard Bill Pay views.

**How do I cancel an individual bill?**

See [here](https://support.ramp.com/hc/en-us/articles/4417814078611-Bill-Lifecycle#cancel-a-bill) for details.
# Payments Runs on Ramp Bill Pay

Source: https://support.ramp.com/hc/en-us/articles/49032108286099-Payments-Runs-on-Ramp-Bill-Pay

![plus.svg](/hc/article_attachments/49032108275347)![Ramp Beta.svg](/hc/article_attachments/49032108276371)

## Overview

Payment runs allow AP teams to group payments together for batch review and release. Instead of releasing payments one by one, a AP team member can prepare a payment run and a Payer can then review and release the entire run at once.

Payment runs are ideal for teams where the person entering bills and managing payments is different from the person authorizing payment release.

Payment runs are an opt-in feature that builds on top of [payment step approvals.](https://support.ramp.com/hc/en-us/articles/34648566601235) Once enabled, you can create runs from the Payments tab, but payments can still be released individually. Payment runs are optional even when the feature is turned on.

**Jump to:**

* [Overview](#overview)
* [Enabling payment runs](#enabling-payment-runs)
* [Creating a payment run](#creating-a-payment-run)
* [Reviewing and releasing payment runs](#reviewing-and-releasing-payment-runs)
* [Turning off payment runs](#turning-off-payment-runs)
* [FAQs](#faqs)

## Enabling payment runs

To enable payment runs:

1. Navigate to **Bill Pay > Settings** (the three-dot menu in the top right corner).
2. Click the **Approvals** tab.
3. Toggle on **Allow creation of payment runs for release**.

**Note:** Payment step approvals must be enabled before the payment runs toggle will appear. If you don't see this option, ensure that payment release approvals are turned on first.

![Bill Pay Payments settings in the Approvals section with options to add payers and toggle for creating payment runs.](/hc/article_attachments/49032134759827)

## Creating a payment run

To create a payment run:

1. Go to the **Payments** tab within Bill Pay.
2. Use filters and sorts to find the payments you'd like to include (for example, filter by bill due date to find everything due in the next week).
3. Select the payments you want to include using the checkboxes.
4. Click **Create payment run**.
5. Review the summary, which shows the selected payments, total amount, and any associated fees.
6. Confirm to create the run.

**What makes a payment eligible for a run:**

A payment can be added to a run only if all of the following are true:

* The bill is **fully approved, but payment is pending release**
* The bills is **not missing information** such as pending vendor edits or missing payment details (excluding payment date)

![Payments page showing a list of transactions with options to add payments to a run.](/hc/article_attachments/49032134760595)

*Video of user adding payments to a run and then releasing payments from the run*

## Reviewing and releasing payment runs

Once payment runs are created, they appear as tiles at the top of the Payments table. Click a tile to filter the table down to the payments in that run.

Runs are automatically categorized based on their status:

* **Upcoming** - None of the payments in the run have been initiated yet
* **Active** - At least one payment has been initiated, but not all have been completed
* **Historical** - All payments in the run have been paid

**Adding and removing payments:**

* You can add eligible payments to a run or remove payments from a run at any time before the run becomes historical.
* You can also **move a payment from one run to another** — for example, shifting a payment from this week's run to next week's run.
* A payment can only belong to **one run at a time**.

![All payments page showing completed payments with options to release or remove them before the run becomes historical.](/hc/article_attachments/49032134762003)

**Releasing a run**

As a Payer, you can release payments from a run in several ways:

* **Release all** — release every payment in the run at once.
* **Selectively release** — release individual payments from within the run.

**Auto-batching within runs**

If multiple payments in the same run are going to the same vendor using the same payment method, they will be **automatically batched** after release. However, auto-batching only applies **within a single run**:

* Payments in **different runs** will not be auto-batched together.
* A payment **inside a run** and a payment **outside of a run** will not be auto-batched together.
* Payments that are both **outside** of any run will still be auto-batched as usual.

## Turning off payment runs

If you disable the payment runs feature in Settings:

* Existing groupings are **removed from view**, but the historical data is retained on the back end.
* If you **re-enable** payment runs later, historical groupings are restored.
* Net new payments can no longer be added to any previously created runs once disabled.

## FAQs

**Can a payment be in multiple runs?**

No. A payment can only belong to one payment run at a time. You can move a payment from one run to another, but it cannot be in two runs simultaneously.

**Who can create and manage payment runs?**

Admin and Accounts Payable roles can create and manage payment runs by default. This is controlled by a distinct permission. Anyone with the ability to view payment details has view access to payment runs.

**Can I release payments without adding them to a run?**

Yes. Payment runs are optional even when the feature is enabled. You can continue to release individual payments directly from the Payments tab or from the Payment Details Drawer without adding them to a run.

**Can I add payments to a run after payment release?**

No. Payments can only by added to a run during the payment release step.

**How do I know which payments have been added to a run?**

Payments that have been added to a run will show a signal on both the Bills and Payments tables. You can also filter by payment run on either table.

**What happens when I turn off payment runs after creating runs?**

Existing run groupings are removed from the UI, but historical data is preserved. If you turn the feature back on, those historical groupings will be restored.
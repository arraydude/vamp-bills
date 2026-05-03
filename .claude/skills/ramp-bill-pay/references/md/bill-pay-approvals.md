# Bill Pay approvals

Source: https://support.ramp.com/hc/en-us/articles/4417843897747-Bill-Pay-approvals

## Overview

Ramp Bill Pay is designed for speed, precision, and security. With our innovative approval and permissions features, you can automate payment workflows, enhance control, and ensure every dollar goes to the right vendor. Here's why you'll love it:

* **Swift approvals:** Say goodbye to bottlenecks with our streamlined approval processes—quickly route bills through customizable approval chains to keep your operations moving swiftly.
* **Complete control:** Empower your team with permissions that match your organizational structure. Assign roles that precisely dictate who can approve, pay, and manage bills.
* **Enhanced security:** Protect your transactions with multi-layered approval requirements. Ensure that every payment is vetted and authorized, reducing the risk of errors or fraud.
* **Detailed tracking:** Track every step in the approval process. With comprehensive audit trails, you can monitor who approved what and when.

**Jump to:**

* [Overview](#overview)
* [How to configure bill approval policy](#how-to-configure-bill-approval-policy)
  + [Where to set up Bill Pay approvals](#where-to-set-up-bill-pay-approvals)
  + [Setting conditions](#setting-conditions)
  + [Adding approvers](#adding-approvers)
    - [Require all vs. Require any](#require-all-vs-require-any)
  + [Approval templates](#approval-templates)
* [Separation of duties](#separation-of-duties)
* [Payment release](#h_payment-release)
* [Reviewing and Approving bills](#reviewing-and-approving-bills)
  + [Approval notifications](#approval-notifications)
  + [Where to find items for your approval](#where-to-find-items-for-your-approval)
* [Editing bills during approval](#h_01K6APPROVER_EDITING)
* [Rejecting bills](#rejecting-bills)
* [AP Approval Agent](#ap-approval-agent)
* [FAQ](#frequently-asked-questions-faqs)

## How to configure bill approval policy

## Where to set up Bill Pay approvals

Admins can create and edit the Bill Pay approval policy from [**Bill Pay settings** > **Approvals**](https://app.ramp.com/s/bill-pay/settings/approvals). This page shows a preview of your existing Bill Pay approval flow.

To view or edit the full approval flow, click the **Edit** button. This action redirects you to the approvals workflow builder, where you can configure complex and flexible approval chains using conditions and outcomes. You can also test the workflow and view or revert to past workflows.

When you click any **Add** button, a drop-down menu appears with the following options to begin configuring your approval chain:

* **Condition**: Add conditions to check bill fields (such as amount, business entity, vendor name, accounting categories, etc.) to help determine the correct approver.
* **Approval**: Select approvers or groups of approvers.
* **Notify**: Specify a specific role type or individual to notify about the bill.
* **Approve bill**: A terminal action that ends the workflow early if added to the chain.

Use the approval workflow builder to layer and nest conditions and approvers to create your ideal approval routing.

## Setting conditions Plus.svg

There are multiple bill fields on which you can route your approvals. While amount-based routing is available to all customers, the conditions listed below are only available to customers on Ramp Plus.

* Amount
* Business Entity ![Plus.svg](/hc/article_attachments/20827111591571)
* Direct Ramp Manager ![Plus.svg](/hc/article_attachments/20827111591571)
* Submitters Department ![Plus.svg](/hc/article_attachments/20827111591571)
* Ramp Department ![Plus.svg](/hc/article_attachments/20827111591571)
* Ramp Location ![Plus.svg](/hc/article_attachments/20827111591571)
* Matched to Purchase Order ![Plus.svg](/hc/article_attachments/20827111591571)
* Vendor Name ![Plus.svg](/hc/article_attachments/20827111591571)
* Vendor Owner ![Plus.svg](/hc/article_attachments/20827111591571)
* Vendor Owner Manager ![Plus.svg](/hc/article_attachments/20827111591571)
* Payment Type ![Plus.svg](/hc/article_attachments/20827111591571)
* GL Fields ![Plus.svg](/hc/article_attachments/20827111591571)

Once a condition has been entered, check the options to fulfill the condition. For example, if the condition is vendor, you would check the vendor names to determine where the approval is routed. Next, add your approvers.

## Adding approvers

When adding approvers, you can select either predetermined roles/groups or specific individuals at your company.

**Approval roles / groups**

* **Any admin:** a group of individuals that have admin permissions within Ramp
* **Department Owner:** for Bill Pay approvals, Ramp will determine the correct department owner by identifying the department owner of the assigned vendor owner. Learn more about configuring department owners [here](https://support.ramp.com/hc/en-us/articles/20843280013459-Setting-up-spend-request-approvals#adding-approvers)
* **Location Owner:** for Bill Pay approvals, Ramp will determine the correct location owner by identifying the location of the assigned vendor owner. Learn more about configuring location owners [here](https://support.ramp.com/hc/en-us/articles/20843280013459-Setting-up-spend-request-approvals#adding-approvers)
* **PO Owner:** the owner of the Ramp purchase order matched to the bill
* **Vendor Owner:** each vendor on Ramp has a designated vendor owner. The vendor owner is a designated employee who manages the vendor relationship. Learn more about vendor owners [here](https://support.ramp.com/hc/en-us/articles/4418793009811-Bill-Pay-Vendors-and-Vendor-Owners)
* **Vendor Owner Manager:** the manager for the designated vendor owner. Learn more about vendor owner managers [here](https://support.ramp.com/hc/en-us/articles/4418793009811-Bill-Pay-Vendors-and-Vendor-Owners)
* **Any custom approval groups:** custom approval groups can be configured within the people tab. Learn more about custom approval groups [here](https://support.ramp.com/hc/en-us/articles/20843280013459-Setting-up-spend-request-approvals#adding-approvers)

**Specific individuals**

* **Any specific employee** - you can add any employee by name within Ramp to the approval flow

### Require all vs. Require any

If multiple approvers are within a step, you need to specify how Ramp should handle their approvals before moving to the next step.

* **Require all:** each individual is required to get approval before proceeding to the next approval step. This translates to “Person X AND Person Y”
* **Require any:** only 1 person from the group is required to approve before proceeding to the next approval step. This translates to “Person X OR Person Y”

## Approval templates

If you need help getting started with Bill Pay approvals - you can take advantage of our pre-configured approval templates based on common approval flows. At this time, we offer the following two templates:

* **Bill Pay Vendor owner and Department owner approval** - this template is available to all Ramp customers. Allows you to require the vendor owner, the department owner, and then an amount trigger that will require an admin to approve
* **Bill Pay approvals by department** ![Plus.svg](/hc/article_attachments/20827111591571)**:** This template is only available to Ramp Plus customers, as it routes approvals using the Ramp Department condition.

Note the template will not be applied to your approvals until you click “Use this Template.”

## Separation of duties

Toggle **Separation of Duties** in the Bill Pay Approval if bill creators should not approve their own bills.

* **When toggled on:** A Ramp account holder cannot approve their own bill that they create. If the bill creator appears on the approval chain - whether that be as vendor owner, department head, custom group, etc) they will be either be removed from the group or replaced by "any admin" group
* **When toggled off:** A ramp account holder can approve their own bills.

**Note:** Only business owners can toggle this setting.

## Payment release

Payment Release adds a second gate after bill approval — a designated payer must explicitly release each payment before funds are sent. To configure, go to [**Bill Pay settings** > **Approvals**](https://app.ramp.com/s/bill-pay/settings/approvals) and enable **Require additional approval to release payment**. You will be prompted to assign which users can release payments.

For full details, see [Bill Pay Payment Release](https://support.ramp.com/hc/en-us/articles/34648566601235-Bill-Pay-Payment-Release).

## Reviewing and Approving Bills

## Approval notifications:

Ramp Bill Pay sends bill approval notifications and reminders. Please be mindful that each user has options to configure their personal notification preferences.

**Email:**

* **Approval needed:** Sent to the designated vendor owner, designated approver, and admin approver.
* **Approval outcome:** The bill was sent to the designated vendor owner and designated approver, indicating whether it was rejected or accepted (the bill creator is also notified if it is rejected).
* **Fully approved or rejected:** Sent to the designated vendor owner and designated approver.

**Please note**: Bill Pay approvers can view the bill's accounting coding in the email sent notifying them of approvals.

**Slack:**

* **Bill created/approval process started:** Posted in the business alerts channel.
* **Approval needed:** Sent via DM to the designated vendor owner, designated approver, and admin approver.
* **2-day reminder:** DM sent to the designated vendor owner and designated approver if no action has been taken.
* **2-day reminder (unactioned bill):** If they are the bill creators, Accounts Payable and Admin roles will receive a direct message.
* **3-day reminder:** DM sent to the designated vendor owner and designated approver if no action has been taken.
* **Fully approved:** Posted in the business alerts channel.
* **Bill rejected:** DMs and business alerts channel notifications sent to all approvers or bill creators.

**Reminders:**

Auto-reminders for bill approvals are sent every day based on these criteria (Reminders are sent only Monday through Friday):

1. 1. Initial reminder + 1 day
   2. The second reminder two days later
   3. The next reminder three days later

## Where to find items for your approval

Items that require your approval can be found both in the Bill Pay and Inbox tabs.

**Bill Pay**

Navigate to the **For** **approval** tab and add the filter **Next** **approver** for yourself to view all bills that require your approval

**Inbox**

Navigate to the Bills tab within the Inbox view to see all bills that require your approval. This inbox view is also accessible via the Ramp mobile app.

**Note:** Admins, Business Owners, and Accounts Payable roles can see all bills that need approval on the [Approvals](https://app.ramp.com/bill-pay/bills/approvals) page.

## Editing bills during approval

When enabled by an admin, approvers can edit most bill fields directly during the approval process. This allows approvers to correct details, update descriptions, adjust dates, modify line items, apply [line item splits](https://support.ramp.com/hc/en-us/articles/44736835918867-Bill-Pay-Line-Item-Splits-and-Allocation-Templates), and update accounting fields — including using the "Apply to all" option — without needing to reject and resubmit the bill.

Approvers **cannot** edit the following fields:

* Bill total amount
* Payment details
* Vendor

Approvers can edit the purchase order (PO) field, but only to POs they own or that have been pre-matched to a bill they are approving.

Admins and owners can enable or disable this capability from **Bill Pay settings** > **Permissions**.

## Rejecting bills

If you decide not to approve a bill and want to reject it instead, you have two options:

You can reject the bill and provide a reason. The bill will remain in **Rejected** status so a user with bill modification permissions (such as an Admin or Owner) can open it, make updates, and submit it again. For details on which roles include this permission, see [Employee Roles and Permissions on Bill Pay](https://support.ramp.com/hc/en-us/articles/42995022042515-Employee-Roles-and-Permissions-on-Bill-Pay).

Or, you can skip straight to archiving the bill (more on Archived bills [here](https://support.ramp.com/hc/en-us/articles/4417814078611-Bill-lifecycle#archiving-bills)). If the bill is archived, you will need to re-upload it if it still needs to be paid.

## AP Approval Agent Plus.svg

Ramp provides intelligent bill recommendations to help approvers review and act on bills more confidently.

When viewing a bill, Ramp analyzes key details such as vendor history, PO matching, billing patterns, and accounting consistency to surface real-time insights. These insights help approvers identify issues earlier and reduce back-and-forth during reviews.

Depending on your role and the bill’s status, Ramp may show different types of guidance:

* **If you’re on the approval chain:**

  Ramp will display a recommendation to **approve** or **review** the bill based on detected signals.

  + **Approval recommended:** No issues detected.
  + **Review recommended:** Ramp identified one or more areas that may need attention (for example, a pricing change or misalignment with the matched PO).
* **If you’re not on the approval chain:**

  You’ll see **contextual insights** (background information such as vendor history, billing frequency, or past approvals)to help you understand the bill’s context.

Insights are tailored by role. For example, users who don’t have visibility into vendor payment or tax information will not see flags related to those fields.

These recommendations and insights appear directly on the **bill approval page**. Ramp does not take any approval action automatically - all final decisions remain with approvers.

## Frequently Asked Questions (FAQs)

1. **How do I view a bill's approval history?**
   * Every bill has an approval history, regardless of the number of steps it went through. You can view a bill’s approval history by navigating to the bill and clicking on the activity tab.
2. **What happens if you change an approval process after a bill is paid?**
   * The bill remains paid, and the approval history will show the previous approval process.
3. **How does the amount-based routing work for international bills in local currency?**
   * For approvals, the bill amount will be converted to USD.
4. **What changes will restart the approval chain?**
   * Customers can configure what type of changes will restart the approval chain by navigating to approval settings. Customers can toggle whether the following fields restart bill approvals:

     + **Vendor** – if the associated vendor on the bill is changed
     + **Payment amount** – if the total amount on the bill is changed
     + **Payment details** – if the payment method, the source account, or the destination account is changed
     + **Payment schedule** – if the payment date is changed

     There are also a few conditions that will **always** restart the approval chain and **cannot be disabled**, regardless of admin configuration. These are enforced to prevent potential fraudulent activity:

     + If the **payment method is changed to or from Ramp card delivery**  
       **and** the **vendor contact email is changed** — both conditions must be true to trigger reapproval
     + If the **current approval instance is rejected**
     + If the **pre-matched transaction on the bill is changed**
5. **Can I approve bills in the mobile app?**
   * + - Yes! Ramp supports reviewing and approve bills right from your phone. Any bills that are currently pending your approval will appear in the mobile inbox manager (supported on iOS and Android).
6. **Can I approve bills in bulk?**
   * Yes, you can approve multiple bills at once by selecting the check box to the left of the bills on the **Bill Pay** > **For approval** tab.
7. **Can I recall, unapprove, or move a bill back to draft?**
   * No. Ramp does not provide a way to unapprove a bill or return it to draft once it has been submitted for approval. If a bill needs corrections while it is pending approval, an approver can **reject** it, and a user with bill modification permissions can then edit and re-submit it. If the bill has already been approved, you can still [edit the bill](https://support.ramp.com/hc/en-us/articles/4417814078611-Bill-lifecycle#editing-bills) — certain edits will restart the approval chain. For the full set of options at each stage, see [Reversing or recalling a bill](https://support.ramp.com/hc/en-us/articles/4417814078611-Bill-lifecycle#reversing-or-recalling-a-bill).
8. **Will approval flows apply retroactively if an approver is added after bills are created?**
   * No. Approval flows do not apply retroactively. For example, if your approval workflow requires Any Admin's approval, and an Admin is added after three bills have already been created, that Admin will not be looped into the approval process for those previously created bills.
9. **A bill was mistakenly rejected after it was already approved. How do I resolve this?**
   * If the bill is still in **Rejected** status, open it from [**Bill Pay**](https://app.ramp.com/bill-pay/bills/approvals), make any needed corrections, and submit it again. It will re-enter the approval workflow from the beginning.

     If the bill was archived instead, you will need to re-upload it:

     1. Navigate to [**Bill Pay**](https://app.ramp.com/bills) and locate the rejected bill. You can filter by **Status > Rejected** from the Overview tab.
     2. Click the three-dot menu to the right of the bill and select **Archive bill**.
     3. Re-upload the original invoice as a new bill via [**Bill Pay**](https://app.ramp.com/bills) **> Drafts > New bill**.
     4. Verify the bill details and submit for approval.

     **Note:** The Archive option requires Admin, Owner, or the Accounts Payable role permissions. If you do not see it, ask your Ramp Admin to archive the bill on your behalf.
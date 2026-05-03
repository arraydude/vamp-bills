# Setting up spend request approvals

Source: https://support.ramp.com/hc/en-us/articles/20843280013459-Setting-up-spend-request-approvals

**Note: This article primarily applies to Ramp Administrators.**  
Cardholders may find other articles in the [Expense policy and receipts](https://support.ramp.com/hc/en-us/sections/360007292054-Expense-policy-and-receipts) section to be more applicable.

## Overview

Whenever a manager issues spend, or an employee requests spend from their dashboard, Ramp provides businesses control and visibility over the requested spend and automatically routes the request for approvals.

Jump to:

* [Overview](#overview)
* [Where to set up spend request approvals](#where-to-set-up-spend-request-approvals)
* [How to set up spend request approvals](#how-to-set-up-spend-request-approvals)
  + [Setting conditions](#setting-conditions)
  + [Adding approvers](#adding-approvers)
* [Separation of duties](#separation-of-duties)
* [Admin-created Spend Requests](#admin-created-spend-requests)
* [Approval notifications](#approval-notifications)

## Where to set up spend request approvals

Those with admin permissions can access spend request approval setup through the **Policy tab**.

Within the spend request approver drawer, you will see a preview of your existing approval flow.

![Spend management controls section showing options for expense reviews, requirements, and spend request approvals.](/hc/article_attachments/49536388478867)![Overview of the spend request approval flow, showing user role conditions and required approvers.](/hc/article_attachments/49536388479251)

## How to set up spend request approvals

To edit and configure your spend request approvals, click the paper and pencil icon within the approval preview. You will be redirected to the approvals workflow builder, where you can configure complex and flexible approvals chains via a series of conditions and outcomes.

Clicking any “Add” button will pull up a drop-down of the following options to begin configuring your approval chain:

* **Require approval:** Specify a specific role type or individual to be added to the approval chain
* **Notify:** Specify a specific role type or individual to be notified about the bill
* **Approve spend:** Terminal action that will end the workflow early if added to the chain
* **Set conditions:** Add conditions to check various spend request fields (e.g., amount, user role, user department, etc.) that assist in determining the correct approver

Within the approval workflow builder, you have the ability to layer and nest these options to create your ideal approval routing. You can also configure separation of duties from the spend request approval drawer on the Policy page.

![Settings page showing the option to enforce separation of duties, preventing users from approving their own requests.](/hc/article_attachments/49536372131987)

## Setting conditions Plus.svg

There are multiple spend request fields by which you can route your approvals. While amount and user role-based routing is available to all customers, the additional conditions in the list below are only available to customers on Ramp Plus.

* Amount
* User role
* Business entity ![Plus.svg](/hc/article_attachments/20843295570707)
* Ramp department ![Plus.svg](/hc/article_attachments/20843295570707)
* Ramp location ![Plus.svg](/hc/article_attachments/20843295570707)

Once a condition has been selected, you can select which options to check for (e.g. if the condition is user role, you would select the role type to check for).

After selecting your desired conditions and options, you will be prompted to add your desired approvers. Learn more about adding approvers in the next section.

Please note, for the amount condition, the dollar amount that is entered is based on annual spend. An example is if the threshold you set is $1,200 and the Spend Program you are issuing has a monthly limit of $100 then it will fail within that approval layer.

### Adding approvers

When adding approvers you have the option to select either predetermined roles/groups or specific individuals at your company.

* **Any admin**: The group of individuals that have admin permissions within Ramp
* **Manager**: The requestor’s manager.
* **Manger’s manager**: The manager of the requestor’s manager.
* **Department owner**: Ramp will determine the department of the requestor and identify the configured department owner. Learn more about configuring department owners [here](https://support.ramp.com/hc/en-us/articles/20843280013459-Setting-up-spend-request-approvals#adding-approvers)
* **Location owner -** Ramp will determine the location of the requestor and identify the configured location owner. Learn more about configuring location owners [here](https://support.ramp.com/hc/en-us/articles/20843280013459-Setting-up-spend-request-approvals#adding-approvers)
* **Any custom approval groups**: Custom approval groups can be configured from [**People**](https://app.ramp.com/people/all) > **Groups** > **Create group**.
* **Any specific employee**: Add any employee within Ramp to the approval flow

**Note:** If spend requests are auto-approved, review your approval workflow for missing approvers. Add at least one approver to ensure all requests require review. Moreover, Approval flows are set at the time a spend request is submitted. Changes to approval workflows only apply to new requests, not those already in progress.

### Require all vs. require any

If there are multiple approvers within a step, you must specify how Ramp should handle their approvals before moving to the next step.

* **Require all** - require each individual’s approval before proceeding to the next approval step. This translates to “Person X AND Person Y”. (Note that if Any admin is added to the step, all admins will have to approve).
* **Require any** - only 1 person from the group is required to approve before proceeding to the next approval step. This translates to “Person X OR Person Y”

### How approval routing works

**Approval routing is set when a transaction or bill is created.** Later changes to approvers do not update existing approvals that are already pending.

**In 'any' workflows**, all listed approvers receive the request at the same time. The order in which approvers are listed does not affect routing. The first person to approve completes the step—no fallback or round-robin is used.

**To change approval routing for future requests**, update approvers before creating new transactions or bills. Changes to the approval workflow will only apply to spend requests created after the update.

## Admin-created Spend Requests

Admins are considered power users in Ramp. At this time, when an Admin creates spend for other employees—those requests are always auto-approved without requiring approval. However, you can prevent Admins from self-approving their own spend by enabling a feature called Separation of Duties.

## Separation of Duties

If your business requires that the individual that creates the spend object (e.g. the requestor) cannot approve their own spend, you can enable the Separation of Duties toggle by following the steps below:

1. Go to **the Policy tab** on the left hand navigation menu
2. Click on the **Spend request approvals** drawer under the Spend management controls section
3. Scroll to the bottom of the spend request workflow
4. Toggle on **Separation of duties**

If the toggle is on, when an individual requests spend *and* they are within the approval chain, they will be removed from the approval chain and will be replaced with admin approvers. This means any admin can make the approval.

Please note, that only business owners can toggle this setting on and off.

## Approval notifications

Spend Requests have a series of notifications and communications to keep your bills from being stuck in 'needs approval'.

### Email:

* A spend request needs your approval
* A reminder 2 days after you were assigned an approval step
* You completed your approval step and either rejected or accepted a request
* A request has been fully approved

### Slack (DM or business alerts channel):

* A spend request is created and approval process began: Business alerts channel
* A spend request needs your approval: DM
* A reminder 2 days after you were assigned an approval step: DM
* A reminder 3 days after you were assigned an approval step: DM
* A spend request has been fully approved: Business alerts channel
* A spend request has been rejected : DMs and Business alerts channel

### Ramp app:

In-app alerts appear for Admin and Accounts Payable roles until the bill is canceled or the requested approver approves the bill. Additionally, Admin, Business Owner, and Accounts Payable roles can see all bills that need approval on the Approvals page.
# Bill Pay payment release

Source: https://support.ramp.com/hc/en-us/articles/34648566601235-Bill-Pay-Payment-Release

## Plus (1).svg

## Overview

The Payment Step Approvals feature allows you to add an extra layer of control over the release of funds for bill payments. This feature is designed for companies that need to maintain clear separation of duties between the person approving bills and the person authorizing payments. By enabling this feature, you can ensure that no payment will be released until it is explicitly approved by a designated "Payer."

Note, this feature is only available to customers on Ramp Plus

## Step 1: Turn on payment release setting

1. Navigate to Bill Pay settings > Approvals
2. Add payers who can review and release bills for payments. At this time, only Admin and Accounts Payable roles can be added as payers on Bill Pay

Note, once payment release is turned on, any bills that have not yet been initiated for payment will now be routed through payment release

![Bill Pay Approvals settings showing the payment release toggle and payer assignment](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdTtucf-VPD0xKTfbVw7kMzeZiIxHnHuDLYlX0NanYkyUOmYwds5hYjZ7BxT2QV9QpoRZwu_6w6gtLDPYlmzMQrdc0V38FsdpqghyvlRg8UmLrjRg6OmF0D4IOnbMx9OenmYw7zEhvajIh2CEZN01_BHNA?key=EKQk4_mict1hATIOk3HHiQ)

## Step 2: Review bills for payment release

If payment release is turned on, after bill approvals are complete, the bill will go through payment release review and have a status of **Ready for release**. Individuals with payer permissions will be able to review bills and release them for payment from the Payments tab or from their Ramp inbox.

**Note:** If your company has access to the Payments dashboard, you will release payments from the **Payments** tab instead of the Bills table. From the Bills table, use the **View payment** or **View payments** action to navigate to the Payments dashboard, where you can review and release payments.

You can select to release the payment for today or on a desired schedule date

![Reviewing and releasing a bill for payment from the Payments tab](/hc/article_attachments/34648575615507)

## Frequently Asked Questions

**Will all bills go through payment step approvals?**

At this time if a bills has one of the following payment methods it will not be routed through payment release approvals.

1. Bills paid via credit card
2. Bills paid off of Ramp
3. Bills that are fully paid by a vendor credit

**Can I add multiple layers of approval within payment step approvals?**

While you can add multiple releasers, you can layer their approvals at this time.

**How do I turn off payment step release approvals?**

To turn of payment step approvals, you can navigate to the Bill Pay settings and turn the toggle off.

Please note, turning off the payment step approvals toggle will immediately release all bills that were pending review. If any of those bills have a scheduled date of the current day or in the past those bills will immediately be initiated.
# Bill Pay set up

Source: https://support.ramp.com/hc/en-us/articles/4417760908435-Bill-Pay-Setup

## Overview

Paying bills with Ramp Bill Pay is fast. Setting it up is even faster. In this guide we'll go over the basics, and provide some helpful recommendations on configuring Ramp to best meet your needs.

**Jump to:**

* [Overview](#overview)
* [Set up accounting](#setting-up-accounting)
* [Choose your bank account](#choosing-a-bank-account-for-payments)
* [Implement your approval logic](#add-controls-and-approval-logic)
* [Configure additional permissions](#configure-additional-permissions)
* [Set up automatic invoice forwarding](#set-up-automatic-invoice-forwarding)
* [Pay bills for free with your Ramp Business Account](#pay-bills-for-free-with-your-ramp-business-account)

## Setting up accounting

An important prerequisite step to using Ramp Bill Pay for all your accounts payable needs is to get through accounting set up. If you haven't already integrated with your accounting provider, you'll be prompted to configure this when you get started under the Bill Pay tab in Ramp.

If you want to test out Bill Pay without linking an accounting provider, we can do that, too. Just select **Set up later** and proceed to the next step.

That said, we strongly recommend establishing a direct connection with your accounting provider by following the steps [here](https://support.ramp.com/hc/en-us/articles/4434982407443-Overview-of-Ramp-Accounting#connect-ramp-to-your-accounting-provider), and you can see more about how Bill Pay Accounting works in our [Bill Pay Accounting](https://support.ramp.com/hc/en-us/articles/4418336469011) article.

**Also recommended at this stage:**

If you're switching from Bill.com onto Ramp Bill Pay, you should turn off 2-Way AP Payment Sync and enable 1-Way Transactions Sync in Bill.com's settings. Since both products use your accounting software as a system of record, Bill.com will generate duplicate bills of the ones you create in Ramp. Disabling this will let you delete bills in Bill.com without losing the original bill in your accounting software.

## Choosing a bank account for payments

Next, let's choose the bank account from which you want us to withdraw (debit) funds for your bill payments.

First you'll need to ensure that any account you wish to use for payments is linked and verified to prevent payment issues. We've written more on this in our [Ramp bank connections overview](https://support.ramp.com/hc/en-us/articles/6658328462867-Ramp-bank-connections-overview) article!

Once you're ready to select an account (or accounts), head to the **Payments** section your [Bill Pay settings](https://app.ramp.com/bills/overview/settings) to see all the bank accounts currently eligible. Use the toggle to enable or hide the account in Bill Pay, and then specify the cash account in your accounting provider that corresponds to that bank account.

![Bill Pay settings Payments tab showing enabled bank accounts with cash account mapping](/hc/article_attachments/31861717553427)

**Note:** If you remove and re-add a bank account, it may no longer be selected as your default payment account. Verify your default in [**Bill Pay**](https://app.ramp.com/bills) **> Settings** to avoid unexpected payment routing — see [Setting a default payment account](#setting-a-default-payment-account-for-bill-pay) below.

**Note**: For customers using [Ramp's Multi-Entity support](https://support.ramp.com/hc/en-us/articles/23815251559443-Ramp-support-for-multi-entity-businesses), you can configure these settings differently for each entity.

Use the dropdown to toggle between the entities you've created in Ramp and review the article above if you need help getting set up!

![Bill Pay settings for a multi-entity business showing bank account and cash account configuration](/hc/article_attachments/31861717560851)

## Pay bills for free with your Ramp Business Account

Select your [Ramp Business Account](https://support.ramp.com/hc/en-us/articles/35043351807507-Ramp-Business-Account-Overview) to pay bills without fees while holding your cash for longer. Enjoy unlimited, free same-day ACH payments with the confidence that your vendors receive funds the day you send them. Plus, send free domestic and international wires with no fees.  
To pay with your Ramp Business Account, simply navigate to the **Treasury** tab and click “**Open a free account**”. If you don’t have a Ramp Business Account yet, you can sign up [here](http://app.ramp.com/treasury).

## Setting a default payment account for Bill Pay

Admins can optionally set a default payment account for Bill Pay. This helps streamline the bill payment process when paying vendors for the first time.

**If a default payment account is set:**

* For vendors that have **not** been paid before, Ramp will use the **default payment account**.
* For vendors that have been paid before, Ramp will default to the **last bank account used** for that vendor.

**If a default payment account is not set:**

* For vendors that have **not** been paid before, Ramp will default to the **bank account used on the last bill period**.

To set a default payment account, navigate to **Ramp → Bill Pay → Settings**, then select your preferred source account under **Default payment account**.

## Add controls and approval logic

If you've already completed the steps above, you are free to upload invoices, edit drafts, and pay bills to your vendors, but you may also want to implement controls and policies to make sure AP spend is handled properly.

Ramp allows you to set your bill approval logic directly from [**Bill Pay settings** > **Approvals**](https://app.ramp.com/s/bill-pay/settings/approvals):

![Bill payment approval workflow with amount-based conditions requiring vendor and department owners](/hc/article_attachments/31861717569171)

We've written more about this in detail in our [Bill Pay Approvals](https://support.ramp.com/hc/en-us/articles/4417843897747-Bill-Pay-Approvals) article!

## Configure additional permissions

By default, only your business owner and admins can access Bill Pay.

You can allow additional users to use Bill Pay by assigning them Accounts Payable access! Accounts Payable roles can view, create, and edit bills for any vendor.

We commonly see Accounting roles granted Accounts Payable permissions, but you can enable this for any user in the **Permissions** section of your Bill Pay settings:

![Bill Pay settings Permissions tab showing Accounts Payable section with added users, approver edit toggle, Vendor Network invoice upload toggle, and vendor payment acceleration toggle](/hc/article_attachments/51121366287379)

Read more about Approval Layers and Accounts Payable roles in our [Bill Pay Approvals and Accounts Payable roles](https://support.ramp.com/hc/en-us/articles/4417843897747) article!

## Set up automatic invoice forwarding

Once Ramp has access to your vendors and accounting info, payments have been configured, and your roles and policies have been set up, you're ready to take full advantage of Ramp Bill Pay's time-saving capabilities.

Check out our guide on [AP Email forwarding](https://support.ramp.com/hc/en-us/articles/22179276078739-Uploading-invoices-and-bills-on-Ramp-Bill-Pay) to automatically create draft bills based on vendor invoices you receive!
# Invoice line items: Expense vs. item

Source: https://support.ramp.com/hc/en-us/articles/10859570893203-Invoice-line-items-Expense-vs-item

## Overview

Ramp offers the ability to match invoice line items to “expenses” or “items” and can sync both to your accounting provider.

“Expense” line items are the costs incurred by your business such as rent or office supplies. “Item” line items are any recorded product or service that your business purchases or sells such as Tires or Consulting Services.

## How it works

**Set up**

No set-up is required. If inventory items are detected within your accounting provider, “Item” will auto-appear within your Draft Bill and allow you to populate the bill with items synced from your accounting provider.

Please note, that item matching is only supported for the following accounting providers: NetSuite, QuickBooks, and Xero

### Line Item Matching

During invoice OCR, Ramp will detect if the line item is “expense” or “item” and add line items accordingly.

If it's an “expense” line item, you can match the expense to a GL category in your accounting provider and update additional fields such as department or location based on your accounting provider configuration.

For “item” line items, you have the ability to match and sync to the corresponding inventory item in your accounting provider and can edit fields like the item units and unit price.

![Bill line items showing an Expense line with GL category and an Item line with quantity and rate](/hc/article_attachments/11489233616915)

## Frequently Asked Questions (FAQ)

### Why can’t I set both a category and an item number for a line item?

In Ramp, each line item on a bill must be coded as either an **Expense item** *or* an **Inventory item**—but not both. This distinction is intentional and based on accounting best practices and system constraints:

### Expense items:

* Used for general operating costs (e.g., rent, utilities, software)
* Require only a **GL expense account**, description, and total amount
* Do **not** require item numbers, quantities, or unit prices
* Synced directly to your ERP’s **expense accounts**

### Inventory items:

* Used for goods or services you **resell or track in inventory**
* Require an **item reference** from your ERP, **quantity**, and **unit price**
* Are coded to **inventory or asset accounts**
* Enable advanced features like **partial receiving** and **3-way PO matching**

**Please note:** You cannot mix both types on the same line because:

* Expense lines map to GL accounts
* Inventory lines map to item records and quantity-based tracking
* Mixing the two causes sync conflicts and ambiguity in ERP posting
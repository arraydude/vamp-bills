# Vendor management on Ramp

Source: https://support.ramp.com/hc/en-us/articles/16103495669011-Vendor-management-on-Ramp

## Overview

Relationships with vendors are incredibly important. Ramp makes it easy to create, manage, and pay vendors on time. Vendor management simplifies storing, analyzing, and discovering all your vendor records and data.

**Jump to:**

* [Overview](#overview)
* [Vendor management table](#vendor-management-table)
* [Vendor details](#vendor-details)
  + [Custom fields](#accounting-line-items)
  + [Vendor default payment method](#vendor-default-payment-method)
  + [Net payment terms](#net-payment-terms)
* [Payment & tax details](#payment-amp-tax-details)
* [Creating vendors](#creating-vendors)
  + [Bulk import](#bulk-import-vendors)
* [Mark vendors as active or inactive](#mark-vendors-as-active-or-inactive)
* [Deleting vendors](#deleting-vendors)
* [Vendor ownership](#vendor-owners)
* [Vendor notifications](#vendor-notifications)
* [Vendor settings](#vendor-settings)
* [Frequently asked questions](#faq)

## Vendor management table

All vendors paid by card and bill are housed in the Vendors table. A vendor record is added to this table whenever a card transaction or bill payment for a new vendor occurs (even if the transaction declines or bill payment fails).

You can easily view vendor details like the Vendor owner, Department, Total spend, Tax details, and more. Visibility of vendors varies by user role:

* Admin, Accounts Payable, and Accounting roles can view all vendors
* Vendor owners (and their managers) can view vendors they own

![Vendors table showing vendor names, owners, spend, and department columns](/hc/article_attachments/42070093522195)

Click on a vendor to see the full vendor profile, with details like associated cards & funds, recent bills or card transactions. You can also edit vendor details from here.

![Vendor profile for Salesforce showing bills, purchase orders, and vendor details](/hc/article_attachments/44044592396179)

### Sorting and filtering

You can easily search, sort, and filter for vendors from the Vendors table by a variety of details like name, category, owner, payment type, tax status, etc.

![Vendor table filter dropdown with options like Vendor, Category, and Owner](/hc/article_attachments/44412774671123)

### Merge vendors

If you have duplicate vendors that need to be merged, please reference [this article.](https://support.ramp.com/hc/en-us/articles/39611028364307)

## Vendor details

### Accounting line items

You can assign default accounting preferences for invoice line items in Edit vendor details > Line item accounting. See this page for more information about [Bill Pay Accounting](https://support.ramp.com/hc/en-us/articles/4418336469011).

### Contact info

You must add a vendor contact when creating a vendor. You can update this contact or add additional contacts at any time, and select one as the default. You can send [requests for payment & tax details, and documents](https://support.ramp.com/hc/en-us/articles/24202495913235) from your vendor contact. Only the default contact will receive communications from Ramp, other than requests sent to [multiple contacts](https://support.ramp.com/hc/en-us/articles/24202495913235).

### Ramp category

Ramp Category helps customers classify vendors into specified groups. For vendors paid by card, the category is pre-determined, can't be changed, and is tied to the category restrictions you may set for card purchases. Learn more about setting up category restrictions [here](https://support.ramp.com/hc/en-us/articles/1500001319081-Setting-up-category-and-merchant-restrictions).

You can select a category to classify non-card spend vendors. This classification is helpful when filtering and sorting vendors within the [Vendor Management tab](https://app.ramp.com/vendors).

![Edit vendor page showing Ramp category dropdown with options like SaaS/Software](/hc/article_attachments/44044608007827)

### Documents

Ramp allows you to easily upload and store critical documents relevant to your vendor in the *Documents* section. When you upload a document, Ramp analyzes the document to parse what the document type might be, but you can select the type yourself.

You can also request Documents from vendors. Read more [here](https://support.ramp.com/hc/en-us/articles/16679046687763). ![Vendor profile Documents section with upload area and uploaded contract file](/hc/article_attachments/44044592404883)

### Vendor custom fields

Admins/Accounting roles can create or import custom fields from Vendor settings. To import values for custom fields go to Vendor settings > Setup & approvals > Import custom field values. Download the template and enter values for the fields you want to fill out (ensure they are in the correct format based on the field type to avoid errors, i.e., numbers, boolean, date). Upload the updated template and review any changes, then hit 'Update custom field values' to save.

Edit custom fields on a vendor from the Vendor profile > Edit vendor > Custom fields. You can also filter the vendor management table by custom fields.

## Payment & tax details

You can add payment and tax details for your vendor, or [request them from your vendor](https://support.ramp.com/hc/en-us/articles/24202495913235).

* Only 1 tax address per vendor is supported.
* When paying vendors by check, you can add multiple mailing addresses (no limit) to route payments to the correct remittance location, then select the appropriate address when sending a check payment.
* Ramp allows different vendors to receive ACH or check payments to the same bank account number. When adding payment details for a vendor, there is no restriction against reusing an account number that is already associated with another vendor. Double-check that vendor names are correct to avoid misrouting payments.

Read more about [tax status and vendor tax details here](https://support.ramp.com/hc/en-us/articles/11030575950739), and [TIN verification here](https://support.ramp.com/hc/en-us/articles/31522284413075).

### Vendor default payment method

You can set a default payment method to efficiently and consistently pay vendors. It can be set from a draft bill or vendor profile.

* From a draft bill, when you add or edit a payment method, you can set it as the default
* From a vendor profile, edit Payment details > make preferred method default > Save
  + If there are any **pending bills** for this vendor, you can choose to update their payment method to the new default

![Vendor profile showing default payment method setting](/hc/article_attachments/48071871461523)

* Each vendor can only have 1 default payment method, and it can be edited at any time
* The first payment method added for a vendor will automatically be set as the default
  + If you sent your vendor a request for payment details, once they share their details, if it's the first payment details for that vendor's profile, it will be set as the default automatically and applied to any pending bills for that vendor
* You can update default payment methods in bulk across vendors through the bulk vendor update CSV. See [Bulk update/edit vendors.](https://support.ramp.com/hc/en-us/articles/37654979379347)

### Net payment terms

Net payment terms define the number of days a vendor allows for payment after an invoice is issued. When set on a vendor profile, Ramp automatically calculates the due date on new bills for that vendor using the formula: invoice date + net payment terms = due date. This due date takes precedence over any due date extracted via OCR.

To set or update net payment terms:

1. Navigate to [**Vendors**](https://app.ramp.com/vendors).
2. Click on a vendor to open their profile.
3. Click **Edit vendor details**.
4. Select a value from the **Net payment terms** dropdown.
5. Click **Save**.

Available options:

* Due on receipt
* 7, 10, 15, 30, 45, 60, or 90 days
* Custom (enter any number of days)

**Note:** Only Admins can edit net payment terms. Vendor owners cannot update this field unless they also have an Admin role. You can also update net payment terms in bulk through the bulk vendor update CSV. See [Bulk update/edit vendors](https://support.ramp.com/hc/en-us/articles/37654979379347).

For more detail on how payment terms affect bill creation, see [Bill creation defaults](https://support.ramp.com/hc/en-us/articles/27542443251987-Creating-draft-bills-on-Bill-Pay#bill-creation-defaults) in Creating draft bills on Bill Pay.

## Creating vendors

Ramp supports multiple methods for vendor creation. You can create a vendor:

* From bill creation
  + If your ERP is connected to Ramp, we'll automatically search for any existing vendors that seem relevant to the created bill to match the vendor. If no match is found, you can create a new vendor in your accounting software from Ramp to maintain a 1:1 relationship. It's important to exercise caution and not create duplicate vendors.

![New Bill vendor search showing inactive vendor warning](/hc/article_attachments/44412774673811)

![New bill vendor search matching existing ERP vendor with option to create new](/hc/article_attachments/44412787713939)

![New vendor search showing duplicate prevention with link to existing vendor](/hc/article_attachments/44412787720339)

* From a purchase order
  + Read more about [vendor onboarding in Procurement](https://support.ramp.com/hc/en-us/articles/36171535964563)
* From the Vendors table
  + Click *New vendor* in the top right of the table
* Bulk import
  + Read instructions [below](#bulk-import-vendors)
* [Import vendors from ERP](https://support.ramp.com/hc/en-us/articles/44401749997331)

### Bulk Import Vendors

You can import multiple vendors at once to help onboard to Ramp Bill Pay. Navigate to the [**Vendors**](https://app.ramp.com/vendors) tab > Settings > Import Vendors via CSV. Download the template and fill out as much information as possible.

![Import vendors page with download template and begin import steps](/hc/article_attachments/44412774676755)

**Required Fields**

* **Vendor name:** Ensure the vendor name in the CSV matches the exact vendor name in your accounting provider to avoid creating duplicates. Vendor names cannot be edited after creation in Ramp, but you can edit the name in your accounting provider, then edit the vendor in Ramp and click "save" without making any changes for the new name to sync. You can also optionally add a Vendor DBA Name.
* **Vendor contact email:** This should be your point of contact with the vendor. Entering N/A is not an option.
* **Vendor Owner email:** The email for the person/people at your company that own or manage this vendor. [Learn more about Vendor Owners below.](#vendor-owners)
* **Country code:** The two-digit country code where your vendor is based.
* **State / Province**: Required if the vendor is based out of the US, Canada, or Australia(e.g. NY for New York, AB for Alberta, SA for South Australia). State can only be left blank if the vendor country is not one of these 3.

**Optional Fields**

* **ACH details (Routing/Account number):** Verify all account details are correct. CSV file formatting can often cut off preceding 0s (e.g. CSV may change 0123 to 123) or change numbers to scientific format (e.g. CSV may change 123 to 1.23E+2).
  + If no ACH details are provided, you can request them from the vendor by entering "True" in the **Request ACH details** column. The request will be sent to the email listed in the **Vendor contact email** column.
  + If the ACH details were provided by a vendor over the Vendor Network, you will not be able to view the routing/account numbers for security reasons.
* **Mailing address (address, city, state, postal code):** If you do decide to enter an address for a vendor, the remaining address fields for that vendor will become required (e.g. if you input a city, then address line 1, state, country, and zip code will become required fields
* **Request details from vendors:** You can request specific payment and tax details by entering *True* in the corresponding columns: **Request tax details**, **Request ACH details**, **Request check by mail details**, **Request domestic wire details**, and **Request international payment details**. Each request type is sent separately to the vendor contact email.
* **GL Code:** Add a GL Code to link the vendor in Ramp to a corresponding vendor in your ERP

*Note:* In order for vendors created via bulk upload to be automatically matched to vendors in your ERP, the Vendor Name and GL Code fields in your CSV must exactly match to the vendor name and GL code in your ERP.

Any field (required or option) not listed in the provided template must be added as a [custom field](https://support.ramp.com/hc/en-us/articles/16103495669011-Vendor-management-on-Ramp#accounting-line-items:~:text=the%20following%20vendors%3A-,Vendor%20custom%20fields,-This%20is%20available) after your vendors have been uploaded to Ramp. Once you've clicked **Begin import**, you'll have a chance to clean up the data before finalizing!

**Common Errors:**

Here are a few helpful reminder if you are running into errors while uploading your file:

* Ensure that all fields are correctly formatted. Unsuccessful uploads are most often caused by missing or incorrect fields. See above for a list of [Required and optional fields](#bulk-import-vendors).
* Ensure that all [4 required fields](#bulk-import-vendors) are filled in the correct format.
* The file size may be too large. Ramp can currently handle up to 1,000 vendors at a time, so consider a smaller upload if you're having trouble

## Mark vendors as active or inactive

Admins can mark a vendor as **active** or **inactive** from the vendor profile. Marking a vendor as inactive signals to your team that the vendor should not receive new payments. When a user creates a bill for an inactive vendor, Ramp displays a warning on the bill.

To change a vendor's active or inactive status:

1. Navigate to [**Vendors**](https://app.ramp.com/vendors).
2. Click on the vendor to open their profile.
3. Click **Edit vendor details**.
4. Toggle the **Active** or **Inactive** setting.
5. Click **Save**.

**Note:** Only Admins can change the active or inactive setting. Vendor owners cannot toggle this unless they also have an Admin role.

Marking a vendor as inactive does not automatically cancel or unschedule any existing bills or payments for that vendor. To stop pending payments, you must [unschedule or cancel them separately](https://support.ramp.com/hc/en-us/articles/27579228841875-Managing-bills-and-payments-on-Bill-Pay#bill-bulk-actions) from the [**Bill Pay**](https://app.ramp.com/bills) tab.

## Deleting vendors

To remove a Bill Pay vendor from Ramp you can follow these steps:

1. Delete a single vendor:
   * Go to the vendor profile > Edit vendor details
   * Scroll down to **Danger zone** and click **Delete vendor**
2. Delete multiple vendors at once:
   * Select the vendors from the table using the checkbox
   * Select the 3 dots at the bottom of the page > **Delete vendors**

Past bills for the vendor will not be deleted if the vendor is, and vendors with card transactions or pending bills cannot be deleted. You'll need to fully process, cancel, or archive any bills for vendors you want to delete.

## Vendor owners

A Vendor Owner is the user(s) with the most context about a vendor's transactions and relationship, responsible for managing it. They can answer questions about payments, renewals, and services with this vendor. For example, the marketing manager overseeing Facebook ad spend would be a good vendor owner for Facebook Ads. Vendor owners are often the first approvers in Bill Pay [approval flows](https://support.ramp.com/hc/en-us/articles/4417843897747), confirming that goods or services have been delivered.

**Vendor Owner Capabilities:**

* View all bills for your assigned vendors (regardless of your position in the approval chain)
* Generate new bills for vendors under your management
* Add comments to bills
* Make approval or rejection decisions on bills for your vendors
* Add other vendor owners

**Restrictions:**

Vendor owners cannot edit the following if they aren't an admin -

* Payment information
* Tax information
* Bill accounting fields
* Accounting Vendor
* Net Payment Terms
* Managed / Unmanaged Setting
* Remove vendor owner

### Assign and manage vendor owners

You can assign multiple vendors owners. Add them from the bill when paying a new vendor or directly from the vendor's profile. Vendor owner, Admin, Owner, and Accounts Payable roles from the vendor profile can change the owner from the vendor profile.

A vendor owner is **required** on Bill Pay vendors, but not on vendors only with card transactions.

To bulk update vendor owners, select the vendors from the table > click the 3 dots at the bottom > Edit owners > select the updated owner(s) and save.

## Vendor notifications

Vendors and Admins can receive the following emails:

* Request for payment details (users: Vendor)
* Reminder to add your bank details before the payment date (users: Vendor)
* Reminder to add your bank details on and after the payment date (users: Vendor)
* Vendor bank details added successfully (users: the Accounts Payable role and Admin, if bill originators)
* Vendor bank details failed to add bank details (users: the Accounts Payable role and Admin if bill originators)
* Payment was sent (users: Vendor)
* Payment was delivered (users: Vendor)
* Payment was failed, returned, or changed (users: Vendor)

## Vendor settings

You can manage **vendor requests** in Vendor settings > Vendor onboarding.

* Toggle on **Use entity name in vendor emails** if you want the default entity name to be shown in vendor emails. When this is off, the primary business name will show in emails. This is particularly useful for multi-entity businesses.

## Frequently asked questions

**How do I pause or hold payments for a vendor?**

Ramp does not currently offer a single action to hold all payments for a vendor at once. To prevent payments from going out, use these options depending on the situation:

* **Unschedule approved bills** — Select bills in the [**Bill Pay**](https://app.ramp.com/bills) tab and choose **Unschedule** to remove their payment dates. This prevents payment from being initiated while keeping the bills in your queue. You can reschedule them later when ready. See [bill bulk actions](https://support.ramp.com/hc/en-us/articles/27579228841875-Managing-bills-and-payments-on-Bill-Pay#bill-bulk-actions) for details.
* **Cancel in-flight payments** — For payments that have already been initiated but not yet delivered to the vendor, select the bills and choose **Cancel**. See [Cancel a bill](https://support.ramp.com/hc/en-us/articles/4417814078611-Bill-lifecycle#cancel-a-bill) for details on what happens if funds were already debited from your bank account.
* **Mark the vendor as inactive** — [Marking a vendor inactive](#mark-vendors-as-active-or-inactive) flags the vendor so your team sees a warning when creating new bills for that vendor. This does not stop existing scheduled or in-flight payments.

**Can I put a single bill on hold?**

To prevent a single bill from being paid, you can unschedule it to remove its payment date, or cancel its payment if it has already been initiated. Navigate to the bill in [**Bill Pay**](https://app.ramp.com/bills) and use the available actions. See [Managing bills and payments on Bill Pay](https://support.ramp.com/hc/en-us/articles/27579228841875-Managing-bills-and-payments-on-Bill-Pay#bill-bulk-actions) for the full list of bill actions.

**Does Ramp support early payment discount terms (such as 2/10 net 30)?**

Ramp does not currently support configuring structured early payment discount terms on vendor profiles or bills. [Net payment terms](#net-payment-terms) set the due date for bills but do not include a discount component. To apply a discount or credit against a bill, see [Vendor credits / Credit memos on Ramp Bill Pay](https://support.ramp.com/hc/en-us/articles/21321389409683-Vendor-credits-Credit-memos-on-Ramp-Bill-Pay).

**How do I stop paying a SaaS vendor or cancel a subscription?**

Ramp does not cancel subscriptions with external vendors on your behalf — you must cancel the subscription directly with the vendor. However, Ramp provides several tools to manage the process and stop payments on your side:

* **Mark the contract as "won't renew"** — If you track the vendor's contract in [Contracts & renewals](https://support.ramp.com/hc/en-us/articles/49994632284051-Contracts-renewals) (Ramp Plus), open the contract and select **Mark as won't renew**. You must provide a reason. You can also choose to mark the vendor as inactive at the same time. This records the decision and updates the contract status, but does not automatically stop pending payments or block cards.
* **Mark the vendor as inactive** — [Mark the vendor as inactive](#mark-vendors-as-active-or-inactive) from the vendor profile. This flags the vendor so your team sees a warning when creating new bills, but does not stop existing scheduled or in-flight payments.
* **Lock or terminate the card** — If the subscription charges a Ramp card, lock or terminate that card to prevent future charges. See [How to lock or terminate Ramp funds and cards](https://support.ramp.com/hc/en-us/articles/360048616934-How-to-lock-or-terminate-Ramp-funds-and-cards).
* **Unschedule or cancel pending bills** — If you pay the vendor through Bill Pay, unschedule approved bills or cancel in-flight payments from the [**Bill Pay**](https://app.ramp.com/bills) tab. See [Managing bills and payments on Bill Pay](https://support.ramp.com/hc/en-us/articles/27579228841875-Managing-bills-and-payments-on-Bill-Pay#bill-bulk-actions) for details.

**Note:** Each of these steps is independent. Marking a vendor as inactive or a contract as "won't renew" does not automatically stop pending payments or block cards. Take each step separately based on how you pay the vendor.
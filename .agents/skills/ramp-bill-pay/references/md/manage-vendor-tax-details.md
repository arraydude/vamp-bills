# Manage vendor tax details

Source: https://support.ramp.com/hc/en-us/articles/11030575950739-Bill-Pay-Tax-Support

Bill Pay customers can manage their vendors' tax details within Ramp, making year-end 1099 filing even easier. Ramp supports bulk uploading tax details for multiple vendors, and bulk exporting tax details for 1099 filing or reporting. Customers can also file 1099s directly through Ramp.

**Jump to:**

* [Add Vendor Tax Details](#add-vendor-tax-details)
* [Vendor 1099 Status](#marking-vendors-as-1099-eligible)
* [View Vendor Tax Details](#view-vendor-tax-details)
* [Export Vendor Tax Details](#exporting-vendor-tax-details)
  + [Export vendor tax documents](#exporting-vendor-tax-documents)
* [Bulk Upload Vendor Tax Details](#bulk-upload-vendor-tax-details)

## Add Vendor Tax Details

Accounts Payable and Admin roles can go to a Vendor > Payment & tax > Edit tax details to add or edit a vendor's tax details. They can also [request details directly from vendors](https://support.ramp.com/hc/en-us/articles/24202495913235) within Ramp.

You can upload a vendor's tax document (W9/W8) and Ramp will parse it to automatically populate the tax details. *Note:* Uploading a W8 for international vendors is a PLUS only feature and adding information other than a W8 is not currently supported.

![Tax details form with federal tax classification, vendor legal name, TIN, and address fields](/hc/article_attachments/46015642586643)

When uploading/entering the vendor’s tax details, Federal Tax Classification, Legal Name, TIN, and address are required.

### Vendor Network Tax Detail Updates

When vendors submit or update their tax details through the Vendor Network, those changes require your review and acceptance before they take effect in your Ramp account.

* View and approve requests to update tax details from a vendor on the vendor profile, then reject or accept these updates
* Manual overrides to tax details in Ramp persist and are not auto-overwritten by vendor updates

### Federal Tax Classification

Vendors can be classified as the following:

* Individual/sole proprietor
* C corporation
* S corporation
* Partnership
* Trust/estate
* LLC (Limited liability company)
* Other
* International\*  
  \*For international vendors all other fields will be removed as 1099s are not required for them.

Based on the vendor’s Federal Tax Classification, their TIN will either be their:

* Social Security Number (SSN) - if the classification is Individual/sole proprietor
* Or Employer Identification Number (EIN) - if the classification is not Individual/sole proprietor
* Foreign TIN or VAT Number - if the classification is International

**Please note:** If a Vendor has an LLC S-corp, LLC C-corp, or other LLC distinction where they'll be taxed like an S-corp, they should select "S-corporation" instead of one of the LLC options to align with [IRS requirements](https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies).

## Marking vendors as 1099 eligible

The 1099 status toggle indicates a vendor's 1099 eligibility status for that year. Ramp will automatically set this if a vendor meet's the requirements below, but you can manually override this yourself from a vendor's profile. If you manually adjust the toggle, Ramp will no longer automatically update it unless you undo this.

**1099 eligibility criteria:**

A vendor will automatically be marked as 1099 eligible for a specific year if

* There is ≥ $600 spend in bill payments for that year
  + Bills paid by card are **not** included, bills paid manually outside of Ramp **are** included
* Federal tax classification is not C-Corp, S-Corp, or International (if tax details aren't collected, we will use only Bill Pay spend)

![Vendor tax details section showing legal name, TIN, W-9 document, and 1099 status](/hc/article_attachments/46041902292499)

## View Vendor Tax Details

After saving vendors’ tax details, you can see which vendors have or are missing tax details from the Vendors table. You can add the Tax details column, filter by *Tax details complete* and *Tax details verification status*.

## Exporting Vendor Tax Details

Vendor's TIN details are not viewable in Ramp, only through export which can be done by Admin and Accounts Payable roles. Go to Vendors > click the export icon on the table > Export CSV of vendors paid via bill, including tax details. This file will include all Bill Pay vendors regardless of their 1099 toggle setting. It contains columns for total spend, last 30 day spend, the vendor's tax details, and yearly 1099 eligibility status. The total spend exported will be the total bill payment spend since the vendor's first bill payment.

Since tax details includes sensitive information like the vendor’s TIN, Ramp will require [Multi-Factor Authentication (MFA)](https://support.ramp.com/hc/en-us/articles/5775209997715-Multi-Factor-Authentication) for exports. If you have not recently authenticated via MFA, a pop-up will appear and will ask you to authenticate via your configured authentication method (e.g. via phone or via email).

### Export 1099 Vendors

To export 1099 eligible vendors go to Vendors > click the 3 dots > Download 1099 vendors > select the year. Same rules as above on MFA apply here. This file will include only vendors that have the 1099 toggle set to ON for that year. It will include a column with the annual 1099-able spend made out to that vendor, excluding credit card payments, and the vendor's tax details (if provided).

This can be helpful for those filing 1099s off Ramp, or for reporting/audit purposes.

## Exporting Vendor Tax Documents

You can either individually export or bulk download vendor tax documents (W-9/W-8).

To individually export, go to the vendor profile > Payment & tax > click the document linked under W-9 or W-8 document. To bulk export, go to the Vendors table > click the export icon > Export documents > select W-9. You will receive a secure link (expires after 24 hours) via email to download the files.

## Bulk Upload Vendor Tax Details

You can bulk upload/update tax details in a few different ways:

1. Bulk upload tax documents to add or update tax details - instructions [here](https://support.ramp.com/hc/en-us/articles/16679046687763)
2. Bulk import tax details to add new tax details - instructions [here](https://support.ramp.com/hc/en-us/articles/16103495669011) and details below
3. Bulk update tax details to override existing tax details - instructions [here](https://support.ramp.com/hc/en-us/articles/37654979379347)

For bulk import, the following fields are required for successful upload:

* Vendor Name
* Federal Tax Classification (choose from “Individual, “C-Corporation”, “S-Corporation”, “Partnership”, “Trust”, or "International"\*)  
  \*If "International" is chosen, all other fields in the file will be ignored as 1099s are not required for them.
* Taxpayer Identification Number (TIN)
* Tax Address Line 1 (Ex. “71 5th Ave”)
* City (Ex. “New York”)
* State/Province/Region (Ex. “NY”)
* Zip / Postal Code (Ex. 10003)

After uploading the completed template file, you will see a preview of the list of vendors you are importing. Verify this list is correct and click "Import" to bulk update your vendors with the tax details. If any changes are required, you can correct the info in the template and re-upload.

You can also choose to bulk request tax info here, in which case we will request tax info from all vendors with missing or incomplete tax details.

*Note: If any changes are required, you can correct the info in the template and re-upload.*

*Legal: Ramp does not provide accounting or tax advice. Please work with your accountant to determine the tax requirements applicable to your business.*
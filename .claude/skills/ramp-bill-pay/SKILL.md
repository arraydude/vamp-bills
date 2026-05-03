---
name: ramp-bill-pay
description: Reference for Ramp Bill Pay product behavior — bill lifecycle, statuses, OCR, line items, splits, approvals, payment methods, recurring bills, batch payments, AP aging, vendor management, and accounting sync. Use this skill whenever scoping, designing, prioritizing, or implementing any feature for the vamp-bills take-home that mirrors Ramp Bill Pay capabilities — including discussions of MVP scope, data model, UI flows, statuses, approvals, OCR, or anything else that touches AP/Bill Pay product semantics, even if the user does not explicitly say "Ramp."
---

# Ramp Bill Pay — Product Reference

This skill captures Ramp Bill Pay's product behavior so we can reason about it accurately while building the vamp-bills take-home. Source articles are saved as markdown under `references/md/`. The raw HTML is in `references/raw/` if we need to verify anything.

## What Ramp Bill Pay is

Ramp Bill Pay is Ramp's **Accounts Payable (AP)** product. It does not handle accounts receivable. Companies use it to:

1. Get an invoice from a vendor into the system (email forward, drag-and-drop, CSV upload, in-app form).
2. Let OCR extract invoice/vendor/payment fields into a draft bill.
3. Route the bill through configurable approval chains.
4. Pay the vendor by ACH, card, check, wire, or international payment — Ramp debits the customer's bank and credits the vendor.
5. Sync every bill and payment to the connected accounting system (NetSuite, QuickBooks, Sage Intacct, Xero, etc.).

Ramp's marketing claim: "create, approve, and pay bills in under 60 seconds." That speed framing matters — the product's core value prop is reducing manual AP work.

## Core domain model

These are the entities and concepts you'll see across every article. Keep them in mind when scoping:

- **Bill** — a payable record. Has a vendor, amount, due date, line items, payment method, status, and an associated invoice document. Lives in one of: `Drafts → For Approvals → For Payment → History (Paid / Archived)`.
- **Invoice** — the source document attached to a bill (PDF, PNG, JPG, Excel, CSV, Word). One invoice = one bill (Ramp won't OCR additional attachments).
- **Vendor** — the payee. Has payment details, tax info (W-9), a designated **vendor owner** (an employee who manages the relationship), optional **net payment terms**, and optional default coding.
- **Line item** — a row on a bill. Either an **expense line** (just GL account + amount) or an **item line** (linked to an Item record in the ERP — needed for inventory/COGS workflows).
- **Approval policy** — a workflow with conditions (amount, vendor, department, GL field, etc.) and approvers (specific people, roles like "Vendor Owner", or groups like "Any admin").
- **Payment** — what executes after approval. Two sub-payments under the hood: a debit from the customer's bank and a credit to the vendor.

## Bill lifecycle (the spine of the product)

```
[Invoice arrives]
   ↓ (email forward / drag-drop / CSV / form / vendor network)
[OCR runs ~30-60s] → Smart OCR fills fields, auto-coding agent fills GL coding
   ↓
[Draft bill] — user verifies fields, picks payment method, hits Continue
   ↓
[For Approvals] — routed through approval chain; approvers can edit before approving
   ↓
[For Payment / Scheduled] — approved, payment date set
   ↓
[Initiated → Paid] — Ramp debits customer + credits vendor
   ↓
[History] — viewable forever; can be Archived (soft-deleted but auditable)
```

Side branches: `Rejected`, `Payment failed`, `Waiting for vendor` (missing details), `Waiting for match` (card transactions), `Unscheduled`, `Paid off Ramp`.

The full status taxonomy (from `managing-bills-and-payments-on-bill-pay.md`):
`Missing info • Ready • Awaiting approvals • Scheduled • Initiated • Waiting for match • Ready for payment • Waiting for vendor • Unscheduled • Payment failed • Paid • Archived • Rejected`

## How to use this skill

When the user is **scoping or designing** features, ground the discussion in what Ramp actually does. Don't invent behavior; if you're unsure, read the relevant reference file before answering. The references are organized by topic — see `INDEX.md` in this skill's directory for a topical map.

When you need details on a specific area:

| Topic | Read |
|---|---|
| End-to-end flow | `references/md/bill-lifecycle.md` |
| Product overview | `references/md/bill-pay-overview.md` |
| List/filter/sort/bulk-action UI | `references/md/managing-bills-and-payments-on-bill-pay.md` |
| Invoice intake (4 methods) | `references/md/uploading-invoices-and-bills-on-ramp-bill-pay.md` |
| Email forwarding details | `references/md/bill-pay-ap-email-forwarding.md` |
| Drag-drop / drafts UX | `references/md/creating-draft-bills-on-bill-pay.md` |
| CSV bulk upload | `references/md/bill-pay-spreadsheet-upload-of-bills-via-csv.md` |
| OCR (basic + Smart OCR + auto-coding) | `references/md/ramp-bill-pay-ocr.md` |
| Line items: expense vs item | `references/md/invoice-line-items-expense-vs-item.md` |
| Line item splits & allocation templates | `references/md/bill-pay-line-item-splits-and-allocation-templates.md` |
| Recurring bills | `references/md/creating-and-managing-recurring-bill-payments-on-ramp-s-bill-pay.md` |
| Approval workflows + AP Approval Agent | `references/md/bill-pay-approvals.md` |
| Payment release (separation of duties) | `references/md/bill-pay-payment-release.md` |
| Payment methods (ACH/card/check/wire) | `references/md/bill-payment-methods-and-timelines.md` |
| Card payments | `references/md/pay-bill-pay-invoices-via-ramp-card.md` |
| International transfers | `references/md/international-transfers-on-ramp-bill-pay.md` |
| Batch payments | `references/md/batch-payments-on-ramp-bill-pay.md` |
| Payment runs | `references/md/payments-runs-on-ramp-bill-pay.md` |
| Partial payments | `references/md/partial-payments-on-ramp-bill-pay.md` |
| Bill Pay fees | `references/md/bill-pay-fees.md` |
| AP Aging report | `references/md/where-to-view-ap-aging-report-and-what-s-included.md` |
| Vendors + vendor owners | `references/md/vendor-management-on-ramp.md` |
| Vendor credits / credit memos | `references/md/vendor-credits-credit-memos-on-ramp-bill-pay.md` |
| Vendor tax (W-9, 1099) | `references/md/manage-vendor-tax-details.md` |
| Vendor Network internal invoice | `references/md/internal-invoice-send-an-invoice-on-vendor-network.md` |
| Roles & permissions | `references/md/employee-roles-and-permissions-on-bill-pay.md` |
| Multi-entity businesses | `references/md/ramp-support-for-multi-entity-businesses.md` |
| Spend request approvals (related) | `references/md/setting-up-spend-request-approvals.md` |
| Policy Agent (AI approver) | `references/md/use-policy-agent-for-approvals.md` |
| Bill Pay setup | `references/md/bill-pay-set-up.md` |

## Why this skill matters for the take-home

The take-home is to scope and build a Bill Pay-inspired product. Most Bill Pay features will be **out of scope** for an MVP — the value of this skill is helping us:

- Pick a small, defensible MVP slice (probably: intake → draft → single-step approval → ACH-only payment → simple status view).
- Justify what's in vs. out by referencing what real customers depend on.
- Avoid reinventing details Ramp has already worked out (statuses, intake methods, line item model, approval primitives).

When the user asks "what should the MVP include?", consult `bill-lifecycle.md` first, then weigh which lifecycle stages are non-negotiable vs. which Ramp features (Smart OCR, approval workflows, recurring bills, batch, multi-entity) are clearly post-MVP.

## Re-fetching / updating

The scraper is at `scripts/scrape_ramp.py`. Run it from the project root with the venv activated to refresh content. It uses Playwright (Chromium) to bypass Cloudflare and is scoped to Bill Pay-relevant URL patterns.

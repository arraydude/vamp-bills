# vamp-bills — MVP Scope

A Bill Pay-style accounts payable product, scoped to demo within take-home time budget. Modeled on Ramp Bill Pay; deliberately narrower.

## What we're building (one-paragraph version)

A single-tenant AP app where users create bills (manually, via CSV bulk, or by uploading an invoice image/PDF that an AI vision model parses into form fields), route them through a single per-bill approver, then mark them as paid once the payment has been made out-of-band. Vendors are simple records owned by users. Currency is USD only. The entire payment surface is "manual / paid off-platform" — no rails, no scheduling, no fees.

---

## Lifecycle at a glance

![Bill & Payment lifecycle](diagrams/bill-payment-lifecycle.png)

> Source: [`diagrams/bill-payment-lifecycle.excalidraw`](diagrams/bill-payment-lifecycle.excalidraw) — open in [excalidraw.com](https://excalidraw.com/) to edit.

---

## Design principles

1. **Convergent intake.** Three different ways to create a bill, all landing on the same `Draft` artifact. No branching pipelines downstream.
2. **Two-object lifecycle.** A `Bill` and a `Payment` are separate entities with linked-but-independent state machines, mirroring Ramp's product model. Even though MVP only ever has one Payment per Bill of one method (manual), the schema supports 1:N from day one.
3. **Manual everywhere money moves.** No bank connection, no payment rails, no scheduler. The user pays the vendor however they want and comes back to record it. This eliminates ~70% of the surface area Ramp covers.
4. **Honest single-user demo.** Single role; per-bill approver selection allows self-approval but flags it with a visible "Self-approved" badge so the separation-of-duties intent is preserved as a documented MVP compromise.

---

## In scope

### Intake (3 methods → all produce Drafts)

| Method | What it does |
|---|---|
| **Manual entry** | Empty bill form, user fills all fields by hand. |
| **CSV bulk upload** | Spreadsheet upload, one row per bill. Maps columns to bill fields, creates N drafts in one action. |
| **AI invoice fill** | User uploads an invoice (image or PDF). A vision-capable LLM extracts vendor, invoice number, dates, amounts, line items into the form. **File is upload-and-discard** — used for extraction only, not stored. User reviews/edits before saving. |

### Bill entity

| Field | Required | Notes |
|---|---|---|
| `vendor_id` | ✓ | FK → vendors |
| `invoice_number` | ✓ | Free text, unique per vendor (soft-uniqueness, surface a warning if duplicate) |
| `total_amount` | ✓ | Decimal, must equal sum of line items |
| `currency` | ✓ | Constant `'USD'` for MVP |
| `invoice_date` | ✓ | Date the invoice was issued |
| `due_date` | optional | Used for sort/filter; bill saves without it |
| `description` | ✓ | Free-text memo |
| `approver_id` | ✓ | FK → users; selected at creation |
| `line_items[]` | ✓ | ≥1 line; each `{description, amount}` |
| `status` | ✓ | enum (see lifecycle) |
| `created_by` | ✓ | FK → users |
| `created_at` / `updated_at` | ✓ | timestamps |

### Vendor entity

| Field | Required | Notes |
|---|---|---|
| `name` | ✓ | |
| `email` | ✓ | For potential future "remind vendor" flow; not used in MVP for actual sends |
| `created_at` / `updated_at` | ✓ | |

### Payment entity (1:N from Bill)

| Field | Required | Notes |
|---|---|---|
| `bill_id` | ✓ | FK → bills |
| `amount` | ✓ | = bill.total_amount in MVP (splits later) |
| `status` | ✓ | enum: `pending` / `paid` / `cancelled` |
| `payment_method` | ✓ | enum: `manual_off_platform` (only value for MVP, ready to extend) |
| `paid_at` | optional | Set when status → `paid` |
| `reference` | optional | Free-text note ("Zelle conf #abc", "Wire ref 12345") |
| `created_at` / `updated_at` | ✓ | |

### User entity

| Field | Required |
|---|---|
| `id`, `name`, `email` | ✓ |

Single role. No permissions matrix in MVP.

### Lifecycle (state machine)

**Bill states**

```
                  Manual / CSV / AI-fill
                            │
                            ▼
                         DRAFT
                        /     \
                Missing Info   Ready
                       \        /
                    (user edits to fill required fields)
                            │
                            ▼
                  Awaiting approval ◀──────┐
                       /        \           │
                  Approved    Rejected ─────┘
                      │       (Edit & resubmit)
                      │
                      ▼
                Awaiting payment ─── Edit any field ──▶ back to Awaiting approval
                      │
              ┌───────┴───────┐
              ▼               ▼
            Paid           Archived
       (Mark as paid)     (terminal,
                           no payment)
```

**Bill state transitions**

| From | To | Trigger |
|---|---|---|
| — | `Draft (Missing Info)` | Created via AI-fill or CSV with gaps |
| — | `Draft (Ready)` | Created via Manual or AI-fill/CSV with all required fields |
| `Draft (Missing Info)` | `Draft (Ready)` | User fills in remaining required fields |
| `Draft (Ready)` | `Awaiting approval` | User submits |
| `Awaiting approval` | `Approved` | Approver clicks Approve |
| `Awaiting approval` | `Rejected` | Approver clicks Reject |
| `Rejected` | `Awaiting approval` | User clicks Edit & resubmit |
| `Approved` (i.e. `Awaiting payment`) | `Awaiting approval` | User edits *any* field on the bill |
| `Awaiting payment` | `Paid` | User clicks Mark as paid |
| `Awaiting payment` | `Archived` | User clicks Archive |
| `Draft` / `Rejected` | `Archived` | User clicks Archive |
| `Paid` | (terminal) | — |
| `Archived` | (terminal) | — |

> **Edit-restarts-approval rule.** Any edit on a non-terminal bill (regardless of which field) returns it to `Awaiting approval`. Single rule, no per-field logic — keeps the model honest and the implementation trivial.

**Payment state transitions**

A Payment is auto-created when a Bill transitions to `Approved`.

| From | To | Trigger |
|---|---|---|
| — | `pending` | Bill → Approved |
| `pending` | `paid` | User clicks Mark as paid on the bill |
| `pending` | `cancelled` | User clicks Cancel on the bill |
| `cancelled` | `pending` | Re-approval creates a new Payment (don't transition the old one back) |

> **Cancel vs. Archive.** Cancel voids the Payment (status → cancelled) but the bill returns to `Awaiting payment` — useful if user marked-paid by mistake or changed their mind. Archive closes the bill terminally and cancels any open Payment as a side effect.

### UI surfaces

**Bills list page** (the main view)
- 4 tabs across the top, each a pre-baked status filter:
  - `Drafts` (Missing Info + Ready)
  - `Awaiting approval`
  - `Awaiting payment`
  - `History` (Paid + Archived)
- Per-tab filters: vendor, due date range, amount range
- Sort by clicking column headers: due date, amount, vendor
- Free-text search across vendor name + invoice number
- Primary action: **New bill** button → opens intake chooser (Manual / CSV / Upload invoice)

**Bill detail page**
- Form view of all fields, editable in non-terminal states
- Line items rendered as a list (add/remove rows, totals must reconcile)
- "Self-approved" badge if `approver_id == created_by`
- State-appropriate primary actions in the top-right:
  - Draft: `Submit for approval` (disabled if Missing Info), `Archive`
  - Awaiting approval: `Approve`, `Reject` (visible to approver only)
  - Rejected: `Edit & resubmit`, `Archive`
  - Awaiting payment: `Mark as paid`, `Cancel` (no-op since no payment in flight; treated as "void payment record"), `Archive`, `Edit` (returns to Awaiting approval)
  - Paid / Archived: read-only

**Vendors page**
- Simple CRUD list + form (name, email)

**Settings / user switcher** (for demo only)
- A "View as" dropdown if you choose to seed multiple users (otherwise skip)

### Demo plan

A 3-minute happy-path walkthrough:

1. **Create via AI-fill** — drag a sample invoice PDF onto the New Bill page. Watch the form populate in ~5 seconds. Edit one line item. Save as draft.
2. **Show CSV bulk** — upload a small CSV (3-5 rows). All appear in the Drafts tab.
3. **Submit for approval** — pick approver (yourself for the demo, with the Self-approved badge highlighted as an honest tradeoff).
4. **Approve** — view in the Awaiting approval tab, click Approve.
5. **Mark as paid** — add a reference note ("Wired via Mercury, ref 12345"), click Mark as paid. Bill moves to History.
6. **Show the lifecycle** — open a different bill in Awaiting payment, edit the amount, point out it returned to Awaiting approval. Approve again, Archive instead of paying. Show in History.

---

## Out of scope (with rationale)

| Feature | Why cut |
|---|---|
| **AP email forwarding** (`*@ap.ramp.com`) | Requires real inbox + email parsing infra. Out-of-band setup, low demo value. |
| **Vendor Network** (vendor-side invoice push) | Whole second product surface (vendor accounts, portal, auth). |
| **Recurring bills** | Requires a scheduler + spawned-bill semantics. Most code for least demo impact. Stretch goal. |
| **Payment rails** (ACH, RTP, card, check, wire, SWIFT, FX) | Each is a multi-week integration. Manual covers all use cases for demo purposes. |
| **Payment scheduling / "scheduled" status** | No rails to schedule against. |
| **Payment failed / retry** | No payment to fail. |
| **Payment release / separation of duties** | Ramp Plus feature; complex policy engine. |
| **Partial payments** | Beta even at Ramp. Complex bill-paid-when-all-payments-paid logic. |
| **Smart OCR / auto-coding agent** | Vendor-specific learning loop is its own product. Basic vision-LLM extraction is enough. |
| **Waiting for vendor** state | No vendor-side request mechanism, so this state has no entry point. Collapses cleanly into Missing Info. |
| **Waiting for match** state | Card-payment-specific (single-use Ramp card). No card payments. |
| **ERP / accounting sync** (NetSuite, QBO, Sage, Xero) | Each is a discrete integration. |
| **Multi-currency / FX** | Triggers per-currency formatting, FX rates, conversion. USD-only constant. |
| **Multi-entity** | Org structure complexity for no demo value. |
| **AP Aging report** | Pure list rendering on top of due_date; can add later in 30 min if asked. |
| **File attachments** (post-OCR storage, Email slot, Files slot) | No blob storage, no file viewer. AI-fill uploads are discarded after extraction. |
| **Activity log / audit trail** | Demo could show this but not core; cuttable for time. |
| **Notifications** (email, Slack, in-app inbox) | No notification infra. Approvers check their queue. |
| **Roles & permissions** (Admin / Bookkeeper / AP Clerk / Vendor Owner / etc.) | Single role; per-bill approver picker covers the only authorization decision. |
| **Vendor credits / credit memos** | Reduces bill total — interacts with Payment model. Future scope. |
| **Tax** (W-9 storage, 1099 export) | Vendor-tax sub-product. Out. |
| **Line item splits / allocation templates** | One amount per line; no proration. |
| **Expense vs. item distinction** | ERP integration concept — irrelevant without ERP. |
| **Saved views, column reordering, bulk export** | UI polish features; cuttable. |

---

## Open questions for the build phase

- Tech stack (frontend framework, backend, DB, hosting)
- AI vision provider for invoice extraction (Anthropic, OpenAI, Google) — pick one
- Auth approach (real auth vs. seeded-user dropdown)
- Test coverage budget
- Deployment target (Vercel, Fly, local-only with screen recording)

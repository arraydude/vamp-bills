# CSV Bulk Upload Specification

**Status:** IN PROGRESS
**Created:** 2026-05-09
**Last Updated:** 2026-05-09
**Purpose:** Allow users to upload a CSV file to create multiple draft bills at once.
**Priority:** MEDIUM (demo intake method — one of three ways to create bills)
**Complexity:** MEDIUM

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Design](#3-design)
4. [Implementation Plan](#4-implementation-plan)
5. [Testing Strategy](#5-testing-strategy)
6. [Success Criteria](#6-success-criteria)
7. [Non-Goals](#7-non-goals)

---

## 1. Executive Summary

The MVP scope (`docs/mvp-scope.md`, lines 30–36) defines three bill intake methods: Manual entry, CSV bulk upload, and AI invoice fill. Manual entry is complete. This spec covers CSV bulk upload: "Spreadsheet upload, one row per bill. Maps columns to bill fields, creates N drafts in one action."

### Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Row-to-bill mapping | One row = one bill with one line item | Simplest model; covers the demo use case |
| Vendor resolution | Match by name (case-insensitive), auto-create if not found | No friction — user doesn't need to pre-create vendors |
| Auto-created vendor email | `billing@<slug>.example` placeholder | Satisfies the required `email` field in vendor schema without user input |
| CSV parsing | Client-side (no file upload to server) | Structured JSON sent to tRPC; avoids multipart handling |
| Approver | Defaults to current user | Same as manual bill creation |
| Error handling | All-or-nothing transaction | Partial imports create confusion; rollback on any failure |
| Row limit | 500 max | Prevents unbounded inserts in a single transaction |

### User Flow

1. User clicks **"Import CSV"** button on the bills list page.
2. Dialog opens with a file input accepting `.csv` files.
3. User selects a CSV file.
4. Client parses the CSV, validates fields, shows a **preview table**.
5. Rows with errors are highlighted; user can see what's wrong.
6. User clicks **"Create N bills"** (N = valid row count).
7. Backend resolves vendor names, auto-creates missing vendors, inserts all bills as drafts.
8. Dialog shows **result**: created count + any auto-created vendors.
9. Bills list refreshes showing the new drafts.

---

## 2. Current State Analysis

### What Exists

| Component | Status | Location |
|---|---|---|
| Single bill creation | ✅ Complete | `backend/src/trpc/routers/bills/controller.ts:130–161` |
| Bill Zod schemas | ✅ Complete | `backend/src/domain/bill/schemas.ts` |
| Vendor CRUD | ✅ Complete | `backend/src/trpc/routers/vendors/controller.ts` |
| Vendor Zod schema | ✅ Complete | `backend/src/domain/vendor/schemas.ts` (requires `name` + `email`) |
| Bills list page | ✅ Complete | `frontend/src/routes/bills.tsx` |
| `useCreateBill` hook | ✅ Complete | `frontend/src/api/bills/mutations.ts:26–40` |
| `useVendorsList` hook | ✅ Complete | `frontend/src/api/vendors/queries.ts` |
| Bulk create endpoint | ❌ Missing | — |
| CSV parser | ❌ Missing | — |
| Upload UI | ❌ Missing | — |

### Bill `CreateInput` Shape (reference)

```typescript
// From controller.ts:47–50
{
  vendorId: string;        // FK, required
  approverId: string;      // FK, required
  invoiceNumber: string;   // required, trimmed
  description: string;     // required, trimmed
  currency: "USD";         // literal
  totalAmount: string;     // decimal regex
  invoiceDate: string;     // required
  dueDate?: string;        // optional
  lineItems: Array<{
    description: string;   // required
    amount: string;        // decimal regex
    position: number;      // int >= 0
  }>;                      // min 1
}
```

---

## 3. Design

### 3.1 CSV Format

```csv
vendor,invoice_number,description,amount,invoice_date,due_date
Acme Office Supplies,INV-001,Monthly office supplies,250.00,2026-05-01,2026-06-01
Paper Co,INV-002,Printer paper bulk order,89.50,2026-05-05,
New Vendor Inc,INV-003,Consulting services,1500.00,2026-05-08,2026-06-08
```

| Column | Required | Validation | Maps To |
|---|---|---|---|
| `vendor` | ✓ | Non-empty string | Resolved to `vendorId` by name |
| `invoice_number` | ✓ | Non-empty string | `invoiceNumber` |
| `description` | ✓ | Non-empty string | `description` + line item `description` |
| `amount` | ✓ | Decimal (`^\d+(\.\d{1,2})?$`) | `totalAmount` + line item `amount` |
| `invoice_date` | ✓ | `YYYY-MM-DD` | `invoiceDate` |
| `due_date` | | `YYYY-MM-DD` or empty | `dueDate` |

Fields not in CSV (auto-populated):
- `approverId` → `ctx.user.id` (current user)
- `currency` → `"USD"`
- `createdBy` → `ctx.user.id`
- `status` → `"draft"` (DB default)
- Line item `position` → `0` (single item)

### 3.2 Backend Endpoint

**Procedure:** `bills.createBulk`
**Input:** `{ rows: CsvBillRow[] }` (1–500 rows)
**Output:** `{ created: number; vendorsCreated: string[] }`

Processing steps:
1. Load all existing vendors → build `Map<lowercase_name, id>`.
2. Identify new vendor names from rows not in the map.
3. Batch-insert new vendors with placeholder emails.
4. Update the name→id map with newly created vendors.
5. In a single transaction, for each row:
   - Insert bill row (draft, vendorId from map, approverId = caller).
   - Insert single line item (description, amount, position=0).
6. Return summary.

### 3.3 Vendor Auto-Creation

When a vendor name from the CSV doesn't match any existing vendor:
- Create it with `name` from the CSV.
- Generate email: lowercase the name, replace spaces with hyphens, strip non-alphanumeric chars, append `@example.com`. E.g. "Acme Office Supplies" → `acme-office-supplies@example.com`.
- This is a demo simplification. The user can edit the vendor email later via the Vendors page.

### 3.4 Client-Side CSV Parsing

Manual parser (no PapaParse dependency):
- Split by newline, trim empty trailing lines.
- Parse header row, validate expected columns exist (case-insensitive).
- For each data row: split by comma, handle basic quoted fields.
- Validate each field per the table above.
- Return `{ rows: CsvBillRow[], errors: CsvParseError[] }`.

### 3.5 Upload Dialog UI

Three-step dialog:

**Step 1 — Upload**
- File input (`<input type="file" accept=".csv">`)
- Brief instructions: "Upload a CSV with columns: vendor, invoice_number, description, amount, invoice_date, due_date"

**Step 2 — Preview**
- Table showing parsed rows (Row #, Vendor, Invoice #, Description, Amount, Invoice Date, Due Date)
- Error rows highlighted with inline error messages
- Footer: "N valid rows" / "M errors"
- Buttons: Cancel | Create N bills

**Step 3 — Result**
- Success: "Created N bills" + "Auto-created M vendors: [names]"
- Close button returns to bills list (already refreshed via query invalidation)

---

## 4. Implementation Plan

### Phase 1: Backend — Bulk Create Endpoint

**Files:**
- `packages/backend/src/trpc/routers/bills/controller.ts` — add `csvRowSchema`, `createBulkInputShape`, `createBulk` handler
- `packages/backend/src/trpc/routers/bills/routes.ts` — wire `createBulk`

**Details:**

```typescript
// New schemas in controller.ts
const csvRowSchema = z.object({
  vendor: z.string().trim().min(1),
  invoiceNumber: z.string().trim().min(1),
  description: z.string().trim().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const createBulkInputShape = z.object({
  rows: z.array(csvRowSchema).min(1).max(500),
});
```

The handler imports `vendors` from `app-schema.ts` (already imported in the file) and `db` from `client.ts`. Vendor auto-creation uses `db.insert(vendors).values(newVendors).returning()` outside the main transaction (so vendor IDs are available for bill FKs). Bill + line item insertion happens in a single `db.transaction()`.

### Phase 2: Frontend — CSV Parser

**File:** `packages/frontend/src/lib/csv-parser.ts` (new)

Exports:
- `type CsvBillRow` — matches `csvRowSchema` shape
- `type CsvParseError` — `{ row: number; column: string; message: string }`
- `parseBillsCsv(text: string): { rows: CsvBillRow[]; errors: CsvParseError[] }`

### Phase 3: Frontend — Mutation Hook

**File:** `packages/frontend/src/api/bills/mutations.ts`

Add `useCreateBulkBills()` following the existing mutation pattern. Invalidates both `bills.list` and `vendors.list` on success (since vendors may have been auto-created).

### Phase 4: Frontend — Upload Dialog + Button

**Files:**
- `packages/frontend/src/components/bills/csv-upload-dialog.tsx` (new) — dialog with upload/preview/result states
- `packages/frontend/src/routes/bills.tsx` — add "Import CSV" button next to "New bill"

---

## 5. Testing Strategy

### Unit Tests

**File:** `packages/backend/src/trpc/routers/bills/bills.test.ts`

| Test | What it covers |
|---|---|
| `createBulk` in auth gate `test.each` | UNAUTHORIZED without session |
| Zod validation rejects bad input | Missing vendor, bad amount, bad date format |

### Manual Testing (Browser)

| Step | Expected |
|---|---|
| Click "Import CSV" | Dialog opens with file input |
| Upload valid CSV (3 rows, 1 new vendor) | Preview shows 3 rows, no errors |
| Click "Create 3 bills" | Success: "Created 3 bills, 1 vendor auto-created" |
| Check bills list | 3 new drafts appear |
| Check vendors page | New vendor appears with placeholder email |
| Upload CSV with errors (bad amount, missing vendor name) | Preview highlights errors, valid rows still importable |
| Upload empty CSV | Error: "at least one row is required" |

---

## 6. Success Criteria

- [ ] `bills.createBulk` endpoint accepts array of CSV rows and returns `{ created, vendorsCreated }`
- [ ] Unknown vendor names auto-create vendor records with placeholder email
- [ ] All bills created in `draft` status with `approverId = current user`
- [ ] Client-side CSV parser validates all fields and reports row-level errors
- [ ] Upload dialog shows preview table before creating
- [ ] Bills list refreshes after successful import
- [ ] All existing tests continue to pass
- [ ] `pnpm typecheck` passes

---

## 7. Non-Goals

| Feature | Why excluded |
|---|---|
| Server-side CSV parsing | Unnecessary — structured JSON via tRPC is simpler |
| Multi-line-item bills from CSV | One row = one bill keeps the CSV format simple |
| CSV template download | Nice-to-have; the column names in the instructions suffice for demo |
| Duplicate invoice number detection | Not enforced in manual creation either (soft-uniqueness per MVP scope) |
| CSV with vendor IDs instead of names | Names are more user-friendly for the demo |
| Edit rows in preview before creating | Over-engineering for a demo feature |
| Streaming/chunked upload for large files | 500-row cap makes this unnecessary |

---

## Progress Tracker

- [ ] Phase 1: Backend bulk create endpoint
- [ ] Phase 2: Frontend CSV parser
- [ ] Phase 3: Frontend mutation hook
- [ ] Phase 4: Frontend upload dialog + button
- [ ] Phase 5: Tests
- [ ] Phase 6: Browser testing + PR

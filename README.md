# vamp-bills

A Bill Pay-style accounts payable demo, modeled on Ramp Bill Pay.

**Live demo:** https://vamp-bills.vercel.app

- Scope and lifecycle: [`docs/mvp-scope.md`](./docs/mvp-scope.md)
- Local setup: [`docs/SETUP.md`](./docs/SETUP.md)
- Branching workflow: [`docs/contributing.md`](./docs/contributing.md)

## Features & happy path

Walk through the app in this order to see everything:

1. **Sign up** with email + password
2. **Create a vendor** (name + email) — vendors are required on every bill
3. **Create a bill** — pick your method:
   - **Manual:** fill the form by hand
   - **CSV import:** upload a spreadsheet to create multiple bills at once
   - **AI scan:** drag an invoice image or PDF, watch the form populate in ~5s
4. **Submit for approval** — pick an approver (can be yourself; flagged with a "Self-approved" badge)
5. **Approve** the bill from the "Awaiting approval" tab
6. **Mark as paid** — add an optional reference like "Wire ref 12345" (available to both the creator and the approver)
7. **Edit an approved bill** (creator only) — notice it bounces back to "Awaiting approval" automatically
8. **Archive** when done

Other things to poke at:

- **Tabbed bill list** — Drafts / Awaiting approval / Awaiting payment / History, each with badge counts
- **Search and sort** by vendor, due date, or amount
- **Line items** with automatic total reconciliation (amounts must add up)
- **Financial summary cards** at the top of the bills page (paid total, outstanding, overdue)

## Stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces |
| Frontend | Vite 8 + React 19 + React Compiler, TanStack Router/Query/Form/Table, tRPC client |
| Backend | Express 5 + tRPC 11 + Drizzle + BetterAuth |
| Design system | shadcn/ui (Base UI, Tailwind v4) |
| Database | Postgres (Docker locally, Neon in prod) |
| Tooling | Biome 2 (format + lint), ESLint 10, TypeScript 6 |
| Hosting | Vercel (frontend + Express serverless) + Neon Postgres |
| AI | Vercel AI SDK v6 + Google Gemini 2.5 Flash (invoice extraction) |


## Why this stack?

Well established patterns from the industry, shipped fast with AI assistance. I wired domain-specific skills (tRPC, Drizzle, BetterAuth, shadcn, AI SDK...), MCPs, and spec-driven workflows.

I chose Vite + Express over Next.js: no SSR needed for this app, simpler mental model, and no coupling to a specific platform's framework.

tRPC gives us end-to-end type safety, change a backend return type and the frontend knows immediately, no manual contract syncing.

shadcn/ui gives you full ownership of every component, and its CLI plays well with AI tooling out of the box.

## Bill lifecycle

Every bill follows a strict state machine powered by XState v5:

```
  draft ──SUBMIT──▶ awaiting_approval ──APPROVE──▶ approved ──MARK_PAID──▶ paid
    │                  │         ▲           │                              │
    │                REJECT      │         EDIT                      CANCEL_PAYMENT
    │                  │       EDIT          │                              │
    │                  ▼         │           ▼                              │
    │               rejected ────┘   awaiting_approval               approved
    │                  │                                                   │
    └──ARCHIVE─────────┴──────────────── archived ◀──────────ARCHIVE───────┘
```

The machine runs as a **pure transition function** on the server — no XState interpreter, no frontend dependency. You call `attemptTransition(currentStatus, event, derived)` and get back the next status or a rejection reason. That's it.

Drizzle's `pgEnum` is the source of truth for status values; a compile-time parity check ensures the machine and the DB enum never drift apart. Guards like `isReady` block SUBMIT and APPROVE when required fields are missing or line-item amounts don't reconcile with the total. The backend exposes `availableEvents` on every bill response, so the frontend renders action buttons without ever importing the machine — it just reads what the server says is possible.

## AI invoice scanning

Bills can be created by uploading an invoice image (PNG, JPEG, WebP) or PDF. The "Scan invoice" button on the New Bill page opens a dialog where users drag-and-drop a document. A vision-capable LLM (Gemini 2.5 Flash, free tier) extracts vendor name, invoice number, dates, line items, and amounts into structured output via the Vercel AI SDK's `generateText` + `Output.object`. The form is prefilled with the extracted data, vendor is fuzzy-matched against the existing vendors table, and the user can review/edit before saving.

**Setup:** get a free API key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and add it to `.env.local`:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

**Sample invoices** for testing are in [`docs/invoices/`](./docs/invoices/) — 4 PNG variants (different vendors, line item counts, amounts) and 1 PDF with tax breakdown.


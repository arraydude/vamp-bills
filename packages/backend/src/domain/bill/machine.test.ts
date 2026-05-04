import { describe, expect, it } from "vitest";

import type { BillEvent, BillEventType } from "./events.ts";
import { isReady, missingPaths, readyBillSchema } from "./schemas.ts";
import { BILL_STATUSES } from "./status.ts";
import {
  attemptTransition,
  availableEvents,
  derivedReadiness,
  type TransitionDerived,
} from "./transitions.ts";

const READY: TransitionDerived = { isReady: true };
const NOT_READY: TransitionDerived = { isReady: false };

describe("billMachine — legal transitions (per mvp-scope.md lifecycle table)", () => {
  it.each<[string, Parameters<typeof attemptTransition>[0], BillEventType, string]>([
    ["Draft → Awaiting approval on SUBMIT (when ready)", "draft", "SUBMIT", "awaiting_approval"],
    ["Draft → Archived on ARCHIVE", "draft", "ARCHIVE", "archived"],
    ["Awaiting approval → Approved on APPROVE", "awaiting_approval", "APPROVE", "approved"],
    ["Awaiting approval → Rejected on REJECT", "awaiting_approval", "REJECT", "rejected"],
    ["Awaiting approval → Archived on ARCHIVE", "awaiting_approval", "ARCHIVE", "archived"],
    [
      "Rejected → Awaiting approval on EDIT (edit & resubmit)",
      "rejected",
      "EDIT",
      "awaiting_approval",
    ],
    ["Rejected → Archived on ARCHIVE", "rejected", "ARCHIVE", "archived"],
    ["Approved → Paid on MARK_PAID", "approved", "MARK_PAID", "paid"],
    [
      "Approved → Awaiting approval on EDIT (edit-restarts-approval)",
      "approved",
      "EDIT",
      "awaiting_approval",
    ],
    ["Approved → Archived on ARCHIVE", "approved", "ARCHIVE", "archived"],
    [
      "Paid → Approved on CANCEL_PAYMENT (cancel reverts a paid bill)",
      "paid",
      "CANCEL_PAYMENT",
      "approved",
    ],
    ["Paid → Archived on ARCHIVE", "paid", "ARCHIVE", "archived"],
  ])("%s", (_label, from, eventType, expected) => {
    const result = attemptTransition(from, { type: eventType } as BillEvent, READY);
    expect(result).toEqual({ ok: true, nextStatus: expected });
  });
});

describe("billMachine — illegal transitions are rejected", () => {
  it.each<[string, Parameters<typeof attemptTransition>[0], BillEventType]>([
    // Draft can't be approved/rejected/marked paid/edited (drafts edit fields freely without an event)
    ["APPROVE from draft", "draft", "APPROVE"],
    ["REJECT from draft", "draft", "REJECT"],
    ["MARK_PAID from draft", "draft", "MARK_PAID"],
    ["EDIT from draft", "draft", "EDIT"],
    // Awaiting approval can't submit again, mark paid, or edit (UI hides edit while pending review)
    ["SUBMIT from awaiting_approval", "awaiting_approval", "SUBMIT"],
    ["MARK_PAID from awaiting_approval", "awaiting_approval", "MARK_PAID"],
    ["EDIT from awaiting_approval", "awaiting_approval", "EDIT"],
    // Approved can't submit/approve/reject
    ["SUBMIT from approved", "approved", "SUBMIT"],
    ["APPROVE from approved", "approved", "APPROVE"],
    ["REJECT from approved", "approved", "REJECT"],
    // CANCEL_PAYMENT moved to paid-only (no payment exists in approved any more)
    ["CANCEL_PAYMENT from approved", "approved", "CANCEL_PAYMENT"],
    // Rejected can't approve/reject/submit/mark paid
    ["SUBMIT from rejected", "rejected", "SUBMIT"],
    ["APPROVE from rejected", "rejected", "APPROVE"],
    ["REJECT from rejected", "rejected", "REJECT"],
    ["MARK_PAID from rejected", "rejected", "MARK_PAID"],
    // Paid only allows CANCEL_PAYMENT and ARCHIVE — not terminal anymore
    ["SUBMIT from paid", "paid", "SUBMIT"],
    ["APPROVE from paid", "paid", "APPROVE"],
    ["REJECT from paid", "paid", "REJECT"],
    ["MARK_PAID from paid", "paid", "MARK_PAID"],
    ["EDIT from paid", "paid", "EDIT"],
    // Archived is terminal
    ["SUBMIT from archived", "archived", "SUBMIT"],
    ["APPROVE from archived", "archived", "APPROVE"],
    ["REJECT from archived", "archived", "REJECT"],
    ["MARK_PAID from archived", "archived", "MARK_PAID"],
    ["EDIT from archived", "archived", "EDIT"],
    ["ARCHIVE from archived", "archived", "ARCHIVE"],
  ])("rejects %s", (_label, from, eventType) => {
    const result = attemptTransition(from, { type: eventType } as BillEvent, READY);
    expect(result.ok).toBe(false);
  });
});

describe("billMachine — isReady guard on SUBMIT and APPROVE", () => {
  it("rejects SUBMIT when not ready (missing fields) — kind: guard_failed", () => {
    const result = attemptTransition("draft", { type: "SUBMIT" }, NOT_READY);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("guard_failed");
  });

  it("accepts SUBMIT when both flags true", () => {
    const result = attemptTransition("draft", { type: "SUBMIT" }, READY);
    expect(result).toEqual({ ok: true, nextStatus: "awaiting_approval" });
  });

  // APPROVE gained the same isReady guard so a row that was patched into a
  // not-ready awaiting_approval state (or mutated outside the router) can't
  // progress until the missing fields are filled.
  it("rejects APPROVE when bill is not ready — kind: guard_failed", () => {
    const result = attemptTransition("awaiting_approval", { type: "APPROVE" }, NOT_READY);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("guard_failed");
  });

  it("accepts APPROVE when ready", () => {
    const result = attemptTransition("awaiting_approval", { type: "APPROVE" }, READY);
    expect(result).toEqual({ ok: true, nextStatus: "approved" });
  });
});

describe("billMachine — CANCEL_PAYMENT (paid-only)", () => {
  it("CANCEL_PAYMENT from paid → approved (cancel reverts a paid bill)", () => {
    const result = attemptTransition("paid", { type: "CANCEL_PAYMENT" }, READY);
    expect(result).toEqual({ ok: true, nextStatus: "approved" });
  });

  it("CANCEL_PAYMENT from any non-paid state → wrong_state", () => {
    for (const from of [
      "draft",
      "awaiting_approval",
      "approved",
      "rejected",
      "archived",
    ] as const) {
      const result = attemptTransition(from, { type: "CANCEL_PAYMENT" }, READY);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.kind).toBe("wrong_state");
    }
  });
});

describe("billMachine — failure kinds discriminate wrong_state from guard_failed", () => {
  it("SUBMIT from a state with no SUBMIT handler (paid) → kind: wrong_state", () => {
    const result = attemptTransition("paid", { type: "SUBMIT" }, READY);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("wrong_state");
  });

  it("SUBMIT from draft with not-ready context → kind: guard_failed (handler exists, guard rejects)", () => {
    const result = attemptTransition("draft", { type: "SUBMIT" }, NOT_READY);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("guard_failed");
  });

  it("APPROVE from rejected → kind: wrong_state (no APPROVE handler in rejected)", () => {
    const result = attemptTransition("rejected", { type: "APPROVE" }, READY);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("wrong_state");
  });
});

describe("availableEvents — what the UI button row should show (role-filtered)", () => {
  it("draft (ready) as creator: SUBMIT + ARCHIVE", () => {
    expect(availableEvents("draft", READY, "creator")).toEqual(["SUBMIT", "ARCHIVE"]);
  });

  it("draft (not ready) as creator: only ARCHIVE — SUBMIT hidden by guard", () => {
    expect(availableEvents("draft", NOT_READY, "creator")).toEqual(["ARCHIVE"]);
  });

  it("draft as approver: nothing — drafts are creator-only", () => {
    expect(availableEvents("draft", READY, "approver")).toEqual([]);
  });

  it("awaiting_approval as approver: APPROVE + REJECT", () => {
    expect(availableEvents("awaiting_approval", READY, "approver")).toEqual(["APPROVE", "REJECT"]);
  });

  it("awaiting_approval (not ready) as approver: only REJECT — APPROVE blocked by guard", () => {
    expect(availableEvents("awaiting_approval", NOT_READY, "approver")).toEqual(["REJECT"]);
  });

  it("awaiting_approval as creator: only ARCHIVE", () => {
    expect(availableEvents("awaiting_approval", READY, "creator")).toEqual(["ARCHIVE"]);
  });

  it("approved as creator: MARK_PAID + ARCHIVE + EDIT (no CANCEL_PAYMENT until paid)", () => {
    expect(availableEvents("approved", READY, "creator")).toEqual(["MARK_PAID", "ARCHIVE", "EDIT"]);
  });

  it("approved as approver: nothing — approver's job is done", () => {
    expect(availableEvents("approved", READY, "approver")).toEqual([]);
  });

  it("rejected as creator: EDIT + ARCHIVE (spec ribbon: 'Edit & resubmit' before 'Archive')", () => {
    expect(availableEvents("rejected", READY, "creator")).toEqual(["EDIT", "ARCHIVE"]);
  });

  it("paid as creator: CANCEL_PAYMENT + ARCHIVE", () => {
    expect(availableEvents("paid", READY, "creator")).toEqual(["CANCEL_PAYMENT", "ARCHIVE"]);
  });

  it("archived: nothing — terminal", () => {
    expect(availableEvents("archived", READY, "creator")).toEqual([]);
  });

  it("any state as 'other' (neither creator nor approver): nothing", () => {
    for (const state of [
      "draft",
      "awaiting_approval",
      "approved",
      "rejected",
      "paid",
      "archived",
    ] as const) {
      expect(availableEvents(state, READY, "other")).toEqual([]);
    }
  });
});

describe("BILL_STATUSES — single source from Drizzle pgEnum", () => {
  it("contains all six lifecycle states", () => {
    expect([...BILL_STATUSES].sort()).toEqual(
      ["approved", "archived", "awaiting_approval", "draft", "paid", "rejected"].sort(),
    );
  });
});

describe("derivedReadiness — bridge from schema validation to machine context", () => {
  it("returns { isReady: true } for a complete + reconciled bill", () => {
    const bill = {
      vendorId: "v1",
      invoiceNumber: "INV-001",
      totalAmount: "100.00",
      currency: "USD",
      invoiceDate: "2026-05-01",
      description: "test",
      approverId: "u1",
      lineItems: [
        { description: "x", amount: "60.00", position: 0 },
        { description: "y", amount: "40.00", position: 1 },
      ],
    };
    expect(derivedReadiness(bill)).toEqual({ isReady: true });
  });

  it("returns { isReady: false } for an incomplete bill", () => {
    expect(derivedReadiness({})).toEqual({ isReady: false });
  });
});

describe("readyBillSchema — single-source validation via drizzle-zod + refinements", () => {
  const completeBill = {
    vendorId: "v1",
    invoiceNumber: "INV-001",
    totalAmount: "100.00",
    currency: "USD",
    invoiceDate: "2026-05-01",
    dueDate: null,
    description: "test",
    approverId: "u1",
    createdBy: "u1",
    lineItems: [
      { description: "first", amount: "60.00", position: 0 },
      { description: "second", amount: "40.00", position: 1 },
    ],
  };

  it("missingPaths is empty when complete + reconciled", () => {
    expect(missingPaths(completeBill)).toEqual([]);
  });

  it("isReady returns true when complete + reconciled", () => {
    expect(isReady(completeBill)).toBe(true);
    expect(readyBillSchema.safeParse(completeBill).success).toBe(true);
  });

  it("flags missing vendorId", () => {
    expect(missingPaths({ ...completeBill, vendorId: null })).toContain("vendorId");
  });

  it("flags whitespace-only invoiceNumber", () => {
    expect(missingPaths({ ...completeBill, invoiceNumber: "   " })).toContain("invoiceNumber");
  });

  it("flags zero line items", () => {
    expect(missingPaths({ ...completeBill, lineItems: [] })).toContain("lineItems");
  });

  it("flags totals that do not reconcile (path: totalAmount, message: totals_reconcile)", () => {
    const off = {
      ...completeBill,
      lineItems: [
        { description: "x", amount: "60.00", position: 0 },
        { description: "y", amount: "30.00", position: 1 },
      ],
    };
    const result = readyBillSchema.safeParse(off);
    expect(result.success).toBe(false);
    if (!result.success) {
      const reconcileIssue = result.error.issues.find((i) => i.message === "totals_reconcile");
      expect(reconcileIssue).toBeDefined();
      expect(reconcileIssue?.path).toEqual(["totalAmount"]);
    }
  });

  it("trailing-zero normalization: '100.00' reconciles against ['60', '40.00']", () => {
    const bill = {
      ...completeBill,
      totalAmount: "100.00",
      lineItems: [
        { description: "x", amount: "60", position: 0 },
        { description: "y", amount: "40.00", position: 1 },
      ],
    };
    expect(isReady(bill)).toBe(true);
  });

  it("rejects malformed amount strings (regex catches them before reconcile runs)", () => {
    const bill = {
      ...completeBill,
      lineItems: [
        { description: "x", amount: "sixty", position: 0 },
        { description: "y", amount: "40.00", position: 1 },
      ],
    };
    expect(isReady(bill)).toBe(false);
    expect(missingPaths(bill)).toContain("lineItems");
  });

  it("flags empty vendorId (notNull text accepts '' at the DB layer; refinement catches it)", () => {
    expect(missingPaths({ ...completeBill, vendorId: "" })).toContain("vendorId");
  });

  it("flags empty approverId (same reason as vendorId)", () => {
    expect(missingPaths({ ...completeBill, approverId: "" })).toContain("approverId");
  });

  it("rejects non-USD currency (MVP scope is USD-only)", () => {
    const result = readyBillSchema.safeParse({ ...completeBill, currency: "EUR" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "currency")).toBe(true);
    }
  });

  it("rejects empty/whitespace amount even when others sum to total", () => {
    // Catches the `Number("") === 0` parsing bug: a blank line item must not
    // silently count as zero. The decimal-format regex on `amount` rejects
    // empty/whitespace before the totals refine even sees them.
    const bill = {
      ...completeBill,
      lineItems: [
        { description: "blank", amount: "", position: 0 },
        { description: "x", amount: "60.00", position: 1 },
        { description: "y", amount: "40.00", position: 2 },
      ],
    };
    expect(isReady(bill)).toBe(false);
  });
});

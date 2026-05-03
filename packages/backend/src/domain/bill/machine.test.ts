import { describe, expect, it } from "vitest";

import type { BillEvent, BillEventType } from "./events.ts";
import {
  type BillSnapshot,
  hasReconciledLineItems,
  hasRequiredFields,
  isReady,
  type LineItemSnapshot,
  missingFields,
} from "./predicates.ts";
import { BILL_STATUSES } from "./status.ts";
import { attemptTransition, availableEvents, type TransitionDerived } from "./transitions.ts";

const READY: TransitionDerived = {
  hasRequiredFields: true,
  hasReconciledLineItems: true,
};

const NOT_READY: TransitionDerived = {
  hasRequiredFields: false,
  hasReconciledLineItems: false,
};

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
    // Rejected can't approve/reject/submit/mark paid
    ["SUBMIT from rejected", "rejected", "SUBMIT"],
    ["APPROVE from rejected", "rejected", "APPROVE"],
    ["REJECT from rejected", "rejected", "REJECT"],
    ["MARK_PAID from rejected", "rejected", "MARK_PAID"],
    // Paid is terminal
    ["SUBMIT from paid", "paid", "SUBMIT"],
    ["APPROVE from paid", "paid", "APPROVE"],
    ["REJECT from paid", "paid", "REJECT"],
    ["MARK_PAID from paid", "paid", "MARK_PAID"],
    ["EDIT from paid", "paid", "EDIT"],
    ["ARCHIVE from paid", "paid", "ARCHIVE"],
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

describe("billMachine — isReady guard on SUBMIT", () => {
  it("rejects SUBMIT when not ready (missing fields) — kind: guard_failed", () => {
    const result = attemptTransition("draft", { type: "SUBMIT" }, NOT_READY);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("guard_failed");
  });

  it("rejects SUBMIT when fields present but totals don't reconcile — kind: guard_failed", () => {
    const result = attemptTransition(
      "draft",
      { type: "SUBMIT" },
      { hasRequiredFields: true, hasReconciledLineItems: false },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("guard_failed");
  });

  it("accepts SUBMIT when both flags true", () => {
    const result = attemptTransition("draft", { type: "SUBMIT" }, READY);
    expect(result).toEqual({ ok: true, nextStatus: "awaiting_approval" });
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

describe("availableEvents — what the UI button row should show", () => {
  it("draft (ready): SUBMIT + ARCHIVE", () => {
    expect(availableEvents("draft", READY)).toEqual(["SUBMIT", "ARCHIVE"]);
  });

  it("draft (not ready): only ARCHIVE — SUBMIT hidden by guard", () => {
    expect(availableEvents("draft", NOT_READY)).toEqual(["ARCHIVE"]);
  });

  it("awaiting_approval: APPROVE + REJECT + ARCHIVE", () => {
    expect(availableEvents("awaiting_approval", READY)).toEqual(["APPROVE", "REJECT", "ARCHIVE"]);
  });

  it("approved (Awaiting payment): MARK_PAID + ARCHIVE + EDIT", () => {
    expect(availableEvents("approved", READY)).toEqual(["MARK_PAID", "ARCHIVE", "EDIT"]);
  });

  it("rejected: EDIT + ARCHIVE (spec ribbon: 'Edit & resubmit' before 'Archive')", () => {
    expect(availableEvents("rejected", READY)).toEqual(["EDIT", "ARCHIVE"]);
  });

  it("paid: nothing — terminal", () => {
    expect(availableEvents("paid", READY)).toEqual([]);
  });

  it("archived: nothing — terminal", () => {
    expect(availableEvents("archived", READY)).toEqual([]);
  });
});

describe("BILL_STATUSES — single source from Drizzle pgEnum", () => {
  it("contains all six lifecycle states", () => {
    expect([...BILL_STATUSES].sort()).toEqual(
      ["approved", "archived", "awaiting_approval", "draft", "paid", "rejected"].sort(),
    );
  });
});

describe("predicates — missingFields / isReady", () => {
  const completeBill: BillSnapshot = {
    vendorId: "v1",
    invoiceNumber: "INV-001",
    totalAmount: "100.00",
    invoiceDate: "2026-05-01",
    description: "test",
    approverId: "u1",
  };
  const reconciledLineItems: LineItemSnapshot[] = [{ amount: "60.00" }, { amount: "40.00" }];

  it("missingFields returns empty list when complete + reconciled", () => {
    expect(missingFields(completeBill, reconciledLineItems)).toEqual([]);
  });

  it("isReady returns true when complete + reconciled", () => {
    expect(isReady(completeBill, reconciledLineItems)).toBe(true);
    expect(hasRequiredFields(completeBill, reconciledLineItems)).toBe(true);
    expect(hasReconciledLineItems(completeBill, reconciledLineItems)).toBe(true);
  });

  it("flags missing vendor", () => {
    expect(missingFields({ ...completeBill, vendorId: null }, reconciledLineItems)).toContain(
      "vendor",
    );
  });

  it("flags whitespace-only invoice number", () => {
    expect(missingFields({ ...completeBill, invoiceNumber: "   " }, reconciledLineItems)).toContain(
      "invoice_number",
    );
  });

  it("flags zero line items", () => {
    expect(missingFields(completeBill, [])).toContain("line_items");
  });

  it("flags totals that don't reconcile", () => {
    const off: LineItemSnapshot[] = [{ amount: "60.00" }, { amount: "30.00" }];
    expect(missingFields(completeBill, off)).toContain("totals_reconcile");
  });

  it("hasReconciledLineItems handles trailing-zero normalization", () => {
    // total_amount "100.00" should reconcile against [60, 40] regardless of trailing zeros
    expect(
      hasReconciledLineItems({ ...completeBill, totalAmount: "100.00" }, [
        { amount: "60" },
        { amount: "40.00" },
      ]),
    ).toBe(true);
  });

  it("hasReconciledLineItems rejects malformed amount strings", () => {
    expect(hasReconciledLineItems(completeBill, [{ amount: "sixty" }, { amount: "40.00" }])).toBe(
      false,
    );
  });

  it("hasReconciledLineItems rejects empty/whitespace amount even when others sum to total", () => {
    // Catches the `Number("") === 0` parsing bug: a blank line item must not
    // silently count as zero, even if the rest happen to sum exactly to
    // total_amount.
    expect(
      hasReconciledLineItems(completeBill, [
        { amount: "" },
        { amount: "60.00" },
        { amount: "40.00" },
      ]),
    ).toBe(false);
    expect(
      hasReconciledLineItems(completeBill, [
        { amount: "   " },
        { amount: "60.00" },
        { amount: "40.00" },
      ]),
    ).toBe(false);
  });
});

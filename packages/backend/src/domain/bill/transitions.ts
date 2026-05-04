import { getNextTransitions, transition as runTransition } from "xstate";

import type { BillEvent, BillEventType } from "./events.ts";
import { type BillMachineContext, billMachine } from "./machine.ts";
import { isReady } from "./schemas.ts";
import type { BillStatus } from "./status.ts";

// Re-export from schemas.ts as the canonical helper to derive readiness.
// Callers compute it once per request and pass it to attemptTransition /
// availableEvents — no duplicated validation logic in routers/UI.
export type TransitionDerived = BillMachineContext;

export function derivedReadiness(bill: unknown): TransitionDerived {
  return { isReady: isReady(bill) };
}

// Discriminated failure so callers (routers, UI) can distinguish "this button
// is wrong for this status" from "the form is incomplete." `wrong_state` →
// 4xx with a state-mismatch message. `guard_failed` → router should also
// return `missingPaths(bill)` from schemas.ts so the UI can surface what's
// blocking.
export type TransitionResult =
  | { ok: true; nextStatus: BillStatus }
  | { ok: false; kind: "wrong_state"; reason: string }
  | { ok: false; kind: "guard_failed"; reason: string };

// Spec-driven action-ribbon order per state, sourced from
// docs/mvp-scope.md "Bill detail page" → "State-appropriate primary actions".
//
// **Deliberate deviation from spec**: `awaiting_approval` includes ARCHIVE
// even though the spec's lifecycle table and action ribbon both omit it.
// We keep the machine more permissive than the spec's documented UI surface
// so a submitter can pull the plug on a pending-review bill without waiting
// for the approver — the UI may render it through a kebab/overflow menu
// rather than the primary ribbon.
//
// Cancel-only-when-cancellable: `CANCEL_PAYMENT` is offered only on `paid`
// bills (where there's a payment row to void). Approving a bill no longer
// creates a pending Payment, so exposing CANCEL_PAYMENT on `approved` would
// advertise an action that always throws.
const ACTION_ORDER: Record<BillStatus, readonly BillEventType[]> = {
  draft: ["SUBMIT", "ARCHIVE"],
  awaiting_approval: ["APPROVE", "REJECT", "ARCHIVE"],
  approved: ["MARK_PAID", "ARCHIVE", "EDIT"],
  rejected: ["EDIT", "ARCHIVE"],
  paid: ["CANCEL_PAYMENT", "ARCHIVE"],
  archived: [],
};

// Per-event actor authorization, mirroring `assertCreator` / `assertApprover`
// in `routers/bills/helpers.ts`. Single source of truth so the action ribbon
// only renders buttons the current user can actually invoke.
type ActorRole = "creator" | "approver" | "other";

const EVENT_ALLOWED_BY_ROLE: Record<BillEventType, ReadonlySet<ActorRole>> = {
  SUBMIT: new Set(["creator"]),
  APPROVE: new Set(["approver"]),
  REJECT: new Set(["approver"]),
  MARK_PAID: new Set(["creator"]),
  CANCEL_PAYMENT: new Set(["creator"]),
  ARCHIVE: new Set(["creator"]),
  EDIT: new Set(["creator"]),
};

// Resolve the persisted status into an XState snapshot, then classify:
//   1. `wrong_state` — no transition handler for this event in this state
//   2. `guard_failed` — handler has a guard, ran it, value unchanged
//   3. ok — transition fired (state may change, or stay the same when the
//      event is an acknowledged self-action like `CANCEL_PAYMENT`)
//
// We distinguish "guard rejected" from "self-action with no state change"
// by inspecting whether the matched handler declares a `guard`. Only
// guarded transitions can be `guard_failed`; an unguarded handler whose
// value doesn't change is intentional (e.g., the `CANCEL_PAYMENT: {}`
// self-action — bill stays in Approved while the router voids the
// related Payment row out-of-band).
export function attemptTransition(
  current: BillStatus,
  event: BillEvent,
  derived: TransitionDerived,
): TransitionResult {
  const snapshot = billMachine.resolveState({
    value: current,
    context: derived,
  });

  const possible = getNextTransitions(snapshot);
  const handler = possible.find((t) => t.eventType === event.type);
  if (!handler) {
    return {
      ok: false,
      kind: "wrong_state",
      reason: `Cannot ${event.type} a bill in ${current} state`,
    };
  }

  const [next] = runTransition(billMachine, snapshot, event);
  const valueUnchanged = next.value === current;

  if (valueUnchanged && handler.guard) {
    return {
      ok: false,
      kind: "guard_failed",
      reason: `${event.type} blocked: bill is not ready (missing required fields or unreconciled totals)`,
    };
  }

  return { ok: true, nextStatus: next.value as BillStatus };
}

// Which events the UI should render as available actions for a bill in this
// state, given its derived readiness AND the current actor's role. Filtering
// by role here keeps the FE action ribbon honest — non-approvers won't see
// `APPROVE` / `REJECT`, non-creators won't see `MARK_PAID` / `ARCHIVE` /
// `CANCEL_PAYMENT` / `EDIT`. Order matches the spec's action-ribbon per
// state (see `ACTION_ORDER` above for the mapping rationale).
export type { ActorRole };
export function availableEvents(
  current: BillStatus,
  derived: TransitionDerived,
  role: ActorRole,
): BillEventType[] {
  return ACTION_ORDER[current].filter((type) => {
    if (!EVENT_ALLOWED_BY_ROLE[type].has(role)) return false;
    const result = attemptTransition(current, { type } as BillEvent, derived);
    return result.ok;
  });
}

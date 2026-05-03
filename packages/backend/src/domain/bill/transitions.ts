import { getNextTransitions, transition as runTransition } from "xstate";

import type { BillEvent, BillEventType } from "./events.ts";
import { type BillMachineContext, billMachine } from "./machine.ts";
import type { BillStatus } from "./status.ts";

export type TransitionDerived = BillMachineContext;

// Discriminated failure so callers (routers, UI) can distinguish "this button
// is wrong for this status" from "the form is incomplete." `wrong_state` →
// 4xx with a state-mismatch message. `guard_failed` → router should also
// return `missingFields(...)` so the UI can surface what's blocking.
export type TransitionResult =
  | { ok: true; nextStatus: BillStatus }
  | { ok: false; kind: "wrong_state"; reason: string }
  | { ok: false; kind: "guard_failed"; reason: string };

// Spec-driven action-ribbon order per state, sourced from
// docs/mvp-scope.md "Bill detail page" → "State-appropriate primary actions".
// `awaiting_approval` keeps ARCHIVE last even though the spec ribbon doesn't
// list it explicitly — the machine allows it (per the lifecycle table) and
// the UI may surface it via a kebab/overflow menu.
const ACTION_ORDER: Record<BillStatus, readonly BillEventType[]> = {
  draft: ["SUBMIT", "ARCHIVE"],
  awaiting_approval: ["APPROVE", "REJECT", "ARCHIVE"],
  approved: ["MARK_PAID", "ARCHIVE", "EDIT"],
  rejected: ["EDIT", "ARCHIVE"],
  paid: [],
  archived: [],
};

// Resolve the persisted status into an XState snapshot, then either:
//   1. report `wrong_state` if the event has no handler in this state
//   2. report `guard_failed` if a handler exists but the guard rejected
//   3. report success with the next status
//
// The two-step check uses `getNextTransitions(snapshot)` to enumerate all
// transitions out of the current state (including guarded ones) before
// running the pure `transition()` to actually evaluate guards. This is the
// only way to distinguish "no handler" from "handler with failing guard"
// since `transition()` collapses both to a no-op snapshot.
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
  const handled = possible.some((t) => t.eventType === event.type);
  if (!handled) {
    return {
      ok: false,
      kind: "wrong_state",
      reason: `Cannot ${event.type} a bill in ${current} state`,
    };
  }

  const [next] = runTransition(billMachine, snapshot, event);
  if (next.value === current) {
    return {
      ok: false,
      kind: "guard_failed",
      reason: `${event.type} blocked: bill is not ready (missing required fields or unreconciled totals)`,
    };
  }
  return { ok: true, nextStatus: next.value as BillStatus };
}

// Which events the UI should render as available actions for a bill in this
// state, given its derived readiness. Order matches the spec's action-ribbon
// per state — see ACTION_ORDER above for the mapping rationale.
export function availableEvents(current: BillStatus, derived: TransitionDerived): BillEventType[] {
  return ACTION_ORDER[current].filter((type) => {
    const result = attemptTransition(current, { type } as BillEvent, derived);
    return result.ok;
  });
}

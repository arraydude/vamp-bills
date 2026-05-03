import { transition as runTransition } from "xstate";

import type { BillEvent, BillEventType } from "./events.ts";
import { type BillMachineContext, billMachine } from "./machine.ts";
import type { BillStatus } from "./status.ts";

export type TransitionDerived = BillMachineContext;

export type TransitionResult = { ok: true; nextStatus: BillStatus } | { ok: false; reason: string };

const ALL_EVENTS: readonly BillEventType[] = [
  "SUBMIT",
  "APPROVE",
  "REJECT",
  "MARK_PAID",
  "ARCHIVE",
  "EDIT",
];

// Resolve the persisted status into an XState snapshot, fire the event via
// the top-level pure `transition()` helper (which sets up the actor scope
// internally — `machine.transition()` requires you to pass scope yourself),
// and report whether the transition was accepted. A transition is rejected
// when the event has no handler in the current state OR the guard fails —
// both surface as "next.value === current".
export function attemptTransition(
  current: BillStatus,
  event: BillEvent,
  derived: TransitionDerived,
): TransitionResult {
  const snapshot = billMachine.resolveState({
    value: current,
    context: derived,
  });
  const [next] = runTransition(billMachine, snapshot, event);
  if (next.value === current) {
    return {
      ok: false,
      reason: `Cannot ${event.type} a bill in ${current} state`,
    };
  }
  return { ok: true, nextStatus: next.value as BillStatus };
}

// Which events the UI should render as available actions for a bill in this
// state, given its derived readiness. Doesn't include events whose only effect
// is a self-loop. Ordered to match the action ribbon in mvp-scope.md.
export function availableEvents(current: BillStatus, derived: TransitionDerived): BillEventType[] {
  return ALL_EVENTS.filter((type) => {
    const result = attemptTransition(current, { type } as BillEvent, derived);
    return result.ok;
  });
}

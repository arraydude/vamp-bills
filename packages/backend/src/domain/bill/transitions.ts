import { getNextTransitions, transition as runTransition } from "xstate";

import type { BillEvent, BillEventType } from "./events";
import { type BillMachineContext, billMachine } from "./machine";
import { isReady } from "./schemas";
import type { BillStatus } from "./status";

export type TransitionDerived = BillMachineContext;

export function derivedReadiness(bill: unknown): TransitionDerived {
  return { isReady: isReady(bill) };
}

export type TransitionResult =
  | { ok: true; nextStatus: BillStatus }
  | { ok: false; kind: "wrong_state"; reason: string }
  | { ok: false; kind: "guard_failed"; reason: string };

// awaiting_approval includes ARCHIVE (spec deviation) so submitters can cancel pending reviews.
const ACTION_ORDER: Record<BillStatus, readonly BillEventType[]> = {
  draft: ["SUBMIT", "ARCHIVE"],
  awaiting_approval: ["APPROVE", "REJECT", "ARCHIVE"],
  approved: ["MARK_PAID", "ARCHIVE", "EDIT"],
  rejected: ["EDIT", "ARCHIVE"],
  paid: ["CANCEL_PAYMENT", "ARCHIVE"],
  archived: [],
};

type ActorRole = "creator" | "approver";
type ActorRoles = ReadonlySet<ActorRole>;

const EVENT_ALLOWED_BY_ROLE: Record<BillEventType, ReadonlySet<ActorRole> | null> = {
  SUBMIT: new Set(["creator"]),
  APPROVE: new Set(["approver"]),
  REJECT: new Set(["approver"]),
  MARK_PAID: null,
  CANCEL_PAYMENT: new Set(["creator"]),
  ARCHIVE: new Set(["creator"]),
  EDIT: new Set(["creator"]),
};

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

export type { ActorRole, ActorRoles };
export function availableEvents(
  current: BillStatus,
  derived: TransitionDerived,
  roles: ActorRoles,
): BillEventType[] {
  return ACTION_ORDER[current].filter((type) => {
    const allowed = EVENT_ALLOWED_BY_ROLE[type];
    if (allowed !== null) {
      let canAct = false;
      for (const role of roles) {
        if (allowed.has(role)) {
          canAct = true;
          break;
        }
      }
      if (!canAct) return false;
    }
    const result = attemptTransition(current, { type } as BillEvent, derived);
    return result.ok;
  });
}

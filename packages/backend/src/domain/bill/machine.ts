import { type SnapshotFrom, setup } from "xstate";

import type { BillEvent } from "./events.ts";
import type { BillStatus } from "./status.ts";

// Single-boolean derivation: callers run `isReady(bill)` from `schemas.ts`
// (the source of truth for "is this bill submittable") and pass the result
// here. We deliberately don't split into "fields present" + "totals
// reconcile" sub-flags — the machine's only guard is "is the bill ready",
// and surfacing finer-grained reasons is the schema's job (`missingPaths`).
export type BillMachineContext = {
  isReady: boolean;
};

// Pure state machine for the bill lifecycle. Used server-side via the
// package-root `transition(logic, snapshot, event)` helper from `xstate`
// (see `transitions.ts`) — NOT `machine.transition()`, which requires the
// caller to pass actor scope themselves. State lives in the `bills.status`
// DB column; we never need the actor/interpreter runtime.
//
// Lifecycle reference: docs/mvp-scope.md "Bill state transitions" table.
export const billMachine = setup({
  types: {
    context: {} as BillMachineContext,
    events: {} as BillEvent,
  },
  guards: {
    isReady: ({ context }) => context.isReady,
  },
}).createMachine({
  id: "bill",
  initial: "draft",
  context: { isReady: false },
  states: {
    draft: {
      on: {
        SUBMIT: { target: "awaiting_approval", guard: "isReady" },
        ARCHIVE: { target: "archived" },
      },
    },
    awaiting_approval: {
      on: {
        // Readiness guard: a bill that's been patched to a not-ready shape
        // while in awaiting_approval (or a row mutated outside the router)
        // can't be approved until the missing fields are filled.
        APPROVE: { target: "approved", guard: "isReady" },
        REJECT: { target: "rejected" },
        ARCHIVE: { target: "archived" },
      },
    },
    rejected: {
      on: {
        // "Edit & resubmit" per the spec.
        EDIT: { target: "awaiting_approval" },
        ARCHIVE: { target: "archived" },
      },
    },
    approved: {
      on: {
        MARK_PAID: { target: "paid" },
        // Edit-restarts-approval rule from the spec.
        EDIT: { target: "awaiting_approval" },
        ARCHIVE: { target: "archived" },
      },
    },
    paid: {
      on: {
        // Cancel reverts a *paid* bill back to Awaiting payment (Approved)
        // and voids the Payment row. Mirrors the Cancel vs. Archive note in
        // docs/mvp-scope.md.
        CANCEL_PAYMENT: { target: "approved" },
        ARCHIVE: { target: "archived" },
      },
    },
    archived: { type: "final" },
  },
});

// Compile-time parity assertion: every BillStatus must be a machine state
// and vice versa. If you add a status to the Drizzle pgEnum without adding
// a corresponding state below (or vice versa), the build fails here.
// (Extracted from SnapshotFrom rather than `config.states` because the
// latter loses literal-string typing in v5's inferred config type.)
type _MachineStateKeys = SnapshotFrom<typeof billMachine>["value"];
type _StatusToState = BillStatus extends _MachineStateKeys ? true : never;
type _StateToStatus = _MachineStateKeys extends BillStatus ? true : never;
const _parityCheck: [_StatusToState, _StateToStatus] = [true, true];
void _parityCheck;

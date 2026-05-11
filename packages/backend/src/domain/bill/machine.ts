import { type SnapshotFrom, setup } from "xstate";

import type { BillEvent } from "./events.ts";
import type { BillStatus } from "./status.ts";

export type BillMachineContext = {
  isReady: boolean;
};

// Pure transition function — no XState interpreter, state lives in the DB.
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
        APPROVE: { target: "approved", guard: "isReady" },
        REJECT: { target: "rejected" },
        ARCHIVE: { target: "archived" },
      },
    },
    rejected: {
      on: {
        EDIT: { target: "awaiting_approval" },
        ARCHIVE: { target: "archived" },
      },
    },
    approved: {
      on: {
        MARK_PAID: { target: "paid" },
        EDIT: { target: "awaiting_approval" },
        ARCHIVE: { target: "archived" },
      },
    },
    paid: {
      on: {
        // Reverts to approved — payment row is voided separately.
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

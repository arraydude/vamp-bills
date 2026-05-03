// Events the bill state machine accepts. Each tRPC mutation maps 1:1 to one
// of these.
//
// `CANCEL_PAYMENT` is special: per the spec ("Cancel vs. Archive"), Cancel
// voids the bill's pending Payment but the bill itself stays in Approved
// (Awaiting payment). The bill machine handles this as an *acknowledged
// self-action* — no state transition fires — so callers (router/UI) can
// drive it through the same `availableEvents` API as the real transitions
// and the actual payment-side mutation lives on the Payment machine in a
// follow-up PR.
export type BillEvent =
  | { type: "SUBMIT" }
  | { type: "APPROVE" }
  | { type: "REJECT" }
  | { type: "MARK_PAID" }
  | { type: "CANCEL_PAYMENT" }
  | { type: "ARCHIVE" }
  | { type: "EDIT" };

export type BillEventType = BillEvent["type"];

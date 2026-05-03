// Events the bill state machine accepts. Each tRPC mutation maps 1:1 to one
// of these. Payment-side events (cancel/refund/void) belong on the Payment
// machine, which is its own module.
export type BillEvent =
  | { type: "SUBMIT" }
  | { type: "APPROVE" }
  | { type: "REJECT" }
  | { type: "MARK_PAID" }
  | { type: "ARCHIVE" }
  | { type: "EDIT" };

export type BillEventType = BillEvent["type"];

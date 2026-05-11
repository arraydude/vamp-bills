export type BillEvent =
  | { type: "SUBMIT" }
  | { type: "APPROVE" }
  | { type: "REJECT" }
  | { type: "MARK_PAID" }
  | { type: "CANCEL_PAYMENT" }
  | { type: "ARCHIVE" }
  | { type: "EDIT" };

export type BillEventType = BillEvent["type"];

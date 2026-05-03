import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema.ts";

export const billStatus = pgEnum("bill_status", [
  "draft",
  "awaiting_approval",
  "approved",
  "rejected",
  "paid",
  "archived",
]);

export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "cancelled"]);

export const paymentMethod = pgEnum("payment_method", ["manual_off_platform"]);

export const vendors = pgTable(
  "vendors",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("vendors_name_idx").on(table.name)],
);

export const bills = pgTable(
  "bills",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    vendorId: text("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),
    invoiceNumber: text("invoice_number").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").default("USD").notNull(),
    invoiceDate: date("invoice_date").notNull(),
    dueDate: date("due_date"),
    description: text("description").notNull(),
    approverId: text("approver_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    status: billStatus("status").default("draft").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("bills_status_idx").on(table.status),
    index("bills_vendor_id_idx").on(table.vendorId),
    index("bills_due_date_idx").on(table.dueDate),
    index("bills_created_by_idx").on(table.createdBy),
    index("bills_approver_id_idx").on(table.approverId),
    index("bills_vendor_invoice_idx").on(table.vendorId, table.invoiceNumber),
  ],
);

export const billLineItems = pgTable(
  "bill_line_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    billId: text("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("bill_line_items_bill_id_idx").on(table.billId)],
);

export const payments = pgTable(
  "payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    billId: text("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    status: paymentStatus("status").default("pending").notNull(),
    paymentMethod: paymentMethod("payment_method").default("manual_off_platform").notNull(),
    paidAt: timestamp("paid_at"),
    reference: text("reference"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("payments_bill_id_idx").on(table.billId),
    index("payments_status_idx").on(table.status),
  ],
);

export const vendorsRelations = relations(vendors, ({ many }) => ({
  bills: many(bills),
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [bills.vendorId],
    references: [vendors.id],
  }),
  creator: one(user, {
    fields: [bills.createdBy],
    references: [user.id],
    relationName: "bill_creator",
  }),
  approver: one(user, {
    fields: [bills.approverId],
    references: [user.id],
    relationName: "bill_approver",
  }),
  lineItems: many(billLineItems),
  payments: many(payments),
}));

export const billLineItemsRelations = relations(billLineItems, ({ one }) => ({
  bill: one(bills, {
    fields: [billLineItems.billId],
    references: [bills.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  bill: one(bills, {
    fields: [payments.billId],
    references: [bills.id],
  }),
}));

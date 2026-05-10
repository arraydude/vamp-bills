import { TRPCError } from "@trpc/server";
import { createContextInner } from "@vamp-bills/backend/trpc/context.ts";
import { createCallerFactory } from "@vamp-bills/backend/trpc/trpc.ts";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { billsRouter } from "./routes.ts";

// Drizzle's chained query builder is mocked by intercepting the `db`
// module. The chain returns itself for any method call and resolves to
// the configured result when awaited — enough to exercise the auth gate
// and the guard_failed error wiring without standing up Postgres.
//
// The drizzle SQL itself is NOT exercised here. Integration tests
// against a real PG instance (deferred PR) will catch query-shape and
// FK-constraint bugs that this layer can't see.

vi.mock("@vamp-bills/backend/db/client.ts", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Proxy needs structural any to thread through arbitrary chained calls; constraining it would force a chain-method enum that breaks every test it's meant to support.
function mockChain<T>(result: T): any {
  const proxy: unknown = new Proxy(() => {}, {
    get(_, prop) {
      if (prop === "then") {
        const p = Promise.resolve(result);
        return p.then.bind(p);
      }
      if (prop === "catch") {
        const p = Promise.resolve(result);
        return p.catch.bind(p);
      }
      if (prop === "finally") {
        const p = Promise.resolve(result);
        return p.finally.bind(p);
      }
      return () => proxy;
    },
    apply() {
      return proxy;
    },
  });
  return proxy;
}

const fakeUser = (id: string) =>
  ({
    id,
    name: id,
    email: `${id}@test.local`,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- BetterAuth's User type carries many optional fields irrelevant to the auth-gate tests; structural casting avoids re-asserting them per test.
  }) as any;

const createCaller = createCallerFactory(billsRouter);

const noUserCtx = () => createContextInner({ user: null, session: null });
const asUser = (id: string) => createContextInner({ user: fakeUser(id), session: null });

const minimalBillRow = {
  id: "b_1",
  vendorId: "v_1",
  invoiceNumber: "INV-1",
  totalAmount: "100.00",
  currency: "USD",
  invoiceDate: "2026-01-01",
  dueDate: null,
  description: "test",
  approverId: "user-approver",
  status: "draft" as const,
  createdBy: "user-creator",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("bills router — auth gate (UNAUTHORIZED)", () => {
  const validCreateInput = {
    vendorId: "v_1",
    invoiceNumber: "INV-1",
    totalAmount: "100.00",
    currency: "USD" as const,
    invoiceDate: "2026-01-01",
    description: "test",
    approverId: "user-approver",
    lineItems: [{ description: "x", amount: "100.00", position: 0 }],
  };

  test.each([
    ["summary", () => createCaller(noUserCtx()).summary()],
    ["list", () => createCaller(noUserCtx()).list()],
    ["getById", () => createCaller(noUserCtx()).getById({ id: "b_1" })],
    ["create", () => createCaller(noUserCtx()).create(validCreateInput)],
    [
      "createBulk",
      () =>
        createCaller(noUserCtx()).createBulk({
          rows: [
            {
              vendor: "V",
              invoiceNumber: "I",
              description: "D",
              amount: "1.00",
              invoiceDate: "2026-01-01",
            },
          ],
        }),
    ],
    [
      "importCsv",
      () =>
        createCaller(noUserCtx()).importCsv({
          csv: "vendor,invoice_number,description,amount,invoice_date\nV,I,D,1.00,2026-01-01",
        }),
    ],
    ["update", () => createCaller(noUserCtx()).update({ id: "b_1", description: "changed" })],
    ["submit", () => createCaller(noUserCtx()).submit({ id: "b_1" })],
    ["approve", () => createCaller(noUserCtx()).approve({ id: "b_1" })],
    ["reject", () => createCaller(noUserCtx()).reject({ id: "b_1" })],
    ["markPaid", () => createCaller(noUserCtx()).markPaid({ id: "b_1" })],
    ["cancelPayment", () => createCaller(noUserCtx()).cancelPayment({ id: "b_1" })],
    ["archive", () => createCaller(noUserCtx()).archive({ id: "b_1" })],
  ])("%s rejects when ctx.user is null", async (_name, run) => {
    await expect(run()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    } satisfies Partial<TRPCError>);
  });
});

describe("bills router — authorization layer (FORBIDDEN)", () => {
  // We exercise one creator-only and one approver-only path per the
  // assertCreator/assertApprover seam — submit/edit/markPaid/cancelPayment
  // share the same creator predicate, reject shares the same approver
  // predicate, so a regression in any of them would fail one of these.
  test("archive throws FORBIDDEN when caller is not the creator", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");
    vi.mocked(db.select)
      .mockReturnValueOnce(mockChain([minimalBillRow]))
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([{ name: "Approver" }]));

    const caller = createCaller(asUser("someone-else"));
    await expect(caller.archive({ id: "b_1" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<TRPCError>);
  });

  test("submit throws FORBIDDEN when caller is not the creator", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");
    vi.mocked(db.select)
      .mockReturnValueOnce(mockChain([minimalBillRow]))
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([{ name: "Approver" }]));

    // submit is a different creator-only path; covers the assertCreator
    // wiring on the SUBMIT lifecycle entry.
    const caller = createCaller(asUser("user-approver"));
    await expect(caller.submit({ id: "b_1" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<TRPCError>);
  });

  test("approve throws FORBIDDEN when caller is not the approver", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");
    vi.mocked(db.select)
      .mockReturnValueOnce(mockChain([{ ...minimalBillRow, status: "awaiting_approval" }]))
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([{ name: "Approver" }]));

    // Creator is "user-creator", approver is "user-approver". Calling as the
    // creator must be rejected: only the approver can approve.
    const caller = createCaller(asUser("user-creator"));
    await expect(caller.approve({ id: "b_1" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<TRPCError>);
  });

  test("reject throws FORBIDDEN when caller is not the approver", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");
    vi.mocked(db.select)
      .mockReturnValueOnce(mockChain([{ ...minimalBillRow, status: "awaiting_approval" }]))
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([{ name: "Approver" }]));

    // reject is a different approver-only path; covers the assertApprover
    // wiring on the REJECT lifecycle entry.
    const caller = createCaller(asUser("user-creator"));
    await expect(caller.reject({ id: "b_1" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<TRPCError>);
  });
});

describe("bills router — summary", () => {
  test("summary returns aggregated metrics from status rows", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");

    vi.mocked(db.select)
      // statusRows query
      .mockReturnValueOnce(
        mockChain([
          { status: "paid", total: "350.00", billCount: 3 },
          { status: "awaiting_approval", total: "500.00", billCount: 2 },
          { status: "approved", total: "200.00", billCount: 1 },
          { status: "draft", total: "100.00", billCount: 4 },
        ]),
      )
      // overdueRow query
      .mockReturnValueOnce(mockChain([{ total: "150.00", billCount: 1 }]));

    const caller = createCaller(asUser("u_1"));
    const result = await caller.summary();

    expect(result).toEqual({
      paidTotal: 350,
      paidCount: 3,
      outstandingTotal: 700,
      outstandingCount: 3,
      pendingApprovalCount: 2,
      overdueTotal: 150,
      overdueCount: 1,
      avgAmount: 1150 / 10,
      totalCount: 10,
    });
  });

  test("summary returns zeros when no bills exist", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");

    vi.mocked(db.select)
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([undefined]));

    const caller = createCaller(asUser("u_1"));
    const result = await caller.summary();

    expect(result).toEqual({
      paidTotal: 0,
      paidCount: 0,
      outstandingTotal: 0,
      outstandingCount: 0,
      pendingApprovalCount: 0,
      overdueTotal: 0,
      overdueCount: 0,
      avgAmount: 0,
      totalCount: 0,
    });
  });
});

describe("bills router — markPaid reference", () => {
  test("markPaid passes reference through to the payment insert", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");
    const approvedBill = { ...minimalBillRow, status: "approved" as const };

    // loadBundle: bill, lineItems, payment, approverName
    vi.mocked(db.select)
      .mockReturnValueOnce(mockChain([approvedBill]))
      .mockReturnValueOnce(
        mockChain([{ id: "li_1", billId: "b_1", description: "x", amount: "100.00", position: 0 }]),
      )
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([{ name: "Approver" }]));

    const paidBill = { ...approvedBill, status: "paid" as const };
    const paymentRow = {
      id: "pay_1",
      billId: "b_1",
      amount: "100.00",
      status: "paid" as const,
      paymentMethod: "manual_off_platform" as const,
      paidAt: "2026-05-09",
      reference: "Wire ref 12345",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.transaction).mockImplementation(async (fn) => {
      const fakeTx = {
        update: () => mockChain([paidBill]),
        insert: () => mockChain([paymentRow]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock transaction proxy
      return fn(fakeTx as any);
    });

    const caller = createCaller(asUser("user-creator"));
    const result = await caller.markPaid({ id: "b_1", reference: "Wire ref 12345" });
    expect(result.bill.status).toBe("paid");
    expect(result.payment?.reference).toBe("Wire ref 12345");
  });

  test("markPaid without reference stores null", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");
    const approvedBill = { ...minimalBillRow, status: "approved" as const };

    vi.mocked(db.select)
      .mockReturnValueOnce(mockChain([approvedBill]))
      .mockReturnValueOnce(
        mockChain([{ id: "li_1", billId: "b_1", description: "x", amount: "100.00", position: 0 }]),
      )
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([{ name: "Approver" }]));

    const paidBill = { ...approvedBill, status: "paid" as const };
    const paymentRow = {
      id: "pay_2",
      billId: "b_1",
      amount: "100.00",
      status: "paid" as const,
      paymentMethod: "manual_off_platform" as const,
      paidAt: "2026-05-09",
      reference: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.transaction).mockImplementation(async (fn) => {
      const fakeTx = {
        update: () => mockChain([paidBill]),
        insert: () => mockChain([paymentRow]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock transaction proxy
      return fn(fakeTx as any);
    });

    const caller = createCaller(asUser("user-creator"));
    const result = await caller.markPaid({ id: "b_1" });
    expect(result.bill.status).toBe("paid");
    expect(result.payment?.reference).toBeNull();
  });
});

describe("bills router — importCsv", () => {
  test("importCsv dryRun returns parsed rows without inserting", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");
    vi.mocked(db.select).mockReturnValueOnce(mockChain([]));

    const caller = createCaller(asUser("user-creator"));
    const result = await caller.importCsv({
      csv: "vendor,invoice_number,description,amount,invoice_date\nAcme,INV-1,Test,100.00,2026-01-01",
      dryRun: true,
    });
    expect("rows" in result).toBe(true);
    if ("rows" in result) {
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.vendor).toBe("Acme");
    }
  });

  test("importCsv rejects bad rows with row-numbered BAD_REQUEST", async () => {
    const caller = createCaller(asUser("user-creator"));
    await expect(
      caller.importCsv({
        csv: "vendor,invoice_number,description,amount,invoice_date\n,INV-1,Test,,bad-date",
        dryRun: true,
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    } satisfies Partial<TRPCError>);
  });
});

describe("bills router — state-machine wiring (BAD_REQUEST + missingPaths)", () => {
  test("submit on a bill missing required fields surfaces missingPaths via GuardFailedError", async () => {
    const { db } = await import("@vamp-bills/backend/db/client.ts");
    // Bill is in draft but invoiceNumber is empty → readiness fails →
    // attemptTransition returns guard_failed → router throws BAD_REQUEST
    // with cause: GuardFailedError(missingPaths).
    const incompleteBill = { ...minimalBillRow, invoiceNumber: "" };
    vi.mocked(db.select)
      .mockReturnValueOnce(mockChain([incompleteBill]))
      .mockReturnValueOnce(
        mockChain([{ id: "li_1", billId: "b_1", description: "x", amount: "100.00", position: 0 }]),
      )
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([{ name: "Approver" }]));

    const caller = createCaller(asUser("user-creator"));
    try {
      await caller.submit({ id: "b_1" });
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(TRPCError);
      const e = err as TRPCError;
      expect(e.code).toBe("BAD_REQUEST");
      // Cause is opaque to the FE — the errorFormatter (verified in
      // errors.test.ts) lifts missingPaths onto error.data.missingPaths.
      // Here we just assert the cause carrier is correct so the formatter
      // has something to lift.
      expect(e.cause).toBeDefined();
      expect((e.cause as { name?: string }).name).toBe("GuardFailedError");
      expect((e.cause as { missingPaths?: readonly string[] }).missingPaths).toContain(
        "invoiceNumber",
      );
    }
  });
});

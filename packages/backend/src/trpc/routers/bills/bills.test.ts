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
    ["list", () => createCaller(noUserCtx()).list()],
    ["getById", () => createCaller(noUserCtx()).getById({ id: "b_1" })],
    ["create", () => createCaller(noUserCtx()).create(validCreateInput)],
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
      .mockReturnValueOnce(mockChain([]));

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
      .mockReturnValueOnce(mockChain([]));

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
      .mockReturnValueOnce(mockChain([]));

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
      .mockReturnValueOnce(mockChain([]));

    // reject is a different approver-only path; covers the assertApprover
    // wiring on the REJECT lifecycle entry.
    const caller = createCaller(asUser("user-creator"));
    await expect(caller.reject({ id: "b_1" })).rejects.toMatchObject({
      code: "FORBIDDEN",
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
      .mockReturnValueOnce(mockChain([]));

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

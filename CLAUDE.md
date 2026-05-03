# CLAUDE.md

Project conventions for AI agents (Claude Code et al.) working in this repo.
This file is loaded into the agent's context on every session.

## TypeScript: no `any`

`@typescript-eslint/no-explicit-any` is configured as **`error`** in every
package's `eslint.config.mjs`. Treat `any` as a code smell, not a tool.

When you reach for `any`, prefer in this order:

1. **`unknown`** at the boundary, then narrow with type guards (`typeof`,
   `instanceof`, Zod, `Array.isArray`, etc.).
2. **A real type** — if you're modeling external data, write the interface or
   import it from the library; if you're modeling internal data, the type
   already exists somewhere upstream.
3. **A generic** — when the function should pass a value through unchanged,
   `<T>(x: T) => T` beats `(x: any) => any`.
4. **`Record<string, unknown>` / `object`** for "some object, shape unknown".

### Allowed escape hatches (rare)

Disable inline with a one-line comment that explains *why*:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- third-party type is wrong; PR upstream pending
const cast = (lib.fn as any)(arg);
```

Acceptable reasons: a third-party type is provably wrong, a complex generic
inference is fighting you for no real safety gain, a code-generation output
(e.g., `routeTree.gen.ts` — already in eslint ignores), or an inherently
heterogeneous bag (tool registries, plugin config) where forcing `unknown`
would just spread `as` casts to every call site.

Never acceptable: "I don't feel like typing it", "the inference is hard",
"it's just temporary".

## Const enums, not `enum`

Use `as const` objects with PascalCase + an inferred type alias. Don't reach
for the TS `enum` keyword — it emits runtime IIFEs and trips over
`verbatimModuleSyntax: true` (set in `tsconfig.base.json`).

```ts
export const BillStatus = {
  Draft: "draft",
  AwaitingApproval: "awaiting_approval",
  Approved: "approved",
  Rejected: "rejected",
  Paid: "paid",
  Archived: "archived",
} as const;
export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus];
```

The string values must match the Drizzle `pgEnum` value tuple in
[`packages/backend/src/db/app-schema.ts`](./packages/backend/src/db/app-schema.ts) —
that's the source of truth at the DB level; the `as const` mirror is the
source of truth on the TS side.

## `type` vs `interface`

Default to `type`. Use `interface` *only* when one type extends another — TS
caches `interface extends` by name; `type X = A & B` is recomputed at every
use ([performance notes](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections)).
This also avoids declaration-merging surprises for non-extending types.

```ts
// Preferred — interface for extension
export interface Bill extends BillCore {
  lineItems: BillLineItem[];
}

// Preferred — type for composition / narrowing
export type BillSummary = Pick<Bill, "id" | "status" | "totalAmount">;
```

## Other standing conventions

- **Type-only imports** required (`@typescript-eslint/consistent-type-imports`
  with `fixStyle: separate-type-imports`). `verbatimModuleSyntax: true` in
  `tsconfig.base.json` makes this load-bearing for ESM correctness, not
  stylistic.
- **Branch model:** `feature/...` → `develop` (preview) → `main` (prod). See
  [`docs/contributing.md`](./docs/contributing.md). Never push directly to
  `main`.
- **Commits via spec:** when phased work is in flight, follow the spec
  in `.claude/specs/<NAME>_SPEC.md`. Each phase ends with a Completion
  Report appended to the spec and a Progress Tracker checkbox flip.
  Completed specs are archived to `.claude/specs/archive/` with the
  completion date in the filename (e.g. the boilerplate scaffolding
  spec is at
  [`.claude/specs/archive/BOILERPLATE_SCAFFOLDING_SPEC_COMPLETED_2026-05-03.md`](./.claude/specs/archive/BOILERPLATE_SCAFFOLDING_SPEC_COMPLETED_2026-05-03.md)).
- **Backend type-only seam:** the frontend imports `AppRouter` from
  `@vamp-bills/backend/trpc/router` *type-only*. The backend's
  `package.json` `exports` map exposes only the `types` condition — value
  imports fail to resolve at the bundler. Don't try to "fix" that.
- **Tests:** none yet. When they land, prefer integration tests against a
  real Postgres (docker-compose), not mocks of the DB layer.

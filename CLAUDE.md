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
- **Workspace package imports across packages.** Every package is
  consumable by name: `@vamp-bills/backend/...`, `@workspace/ui/...`. The
  backend's `package.json` `exports` map exposes `./src/*.ts` so its files
  can be imported directly (`import { db } from "@vamp-bills/backend/db/client.ts"`).
  Convention — not bundler-enforced — keeps the FE from importing backend
  *value* code: the FE only needs `import type { AppRouter } from "@vamp-bills/backend/trpc/router"`
  for tRPC contract sharing. If you find yourself wanting a backend value
  on the FE, that's a sign the logic should move to a shared location, not
  that the import is the right move.
- **Tests:** vitest. Pure-function tests sit alongside the module they cover
  (e.g. `packages/backend/src/domain/bill/machine.test.ts`). Run with
  `pnpm test`. Integration tests (when added) hit real Postgres via
  docker-compose, never mocks of the DB layer.
- **Domain logic:** state machines for entity lifecycles use **XState v5 as
  a pure transition function** (server-side only — no FE dep). Status enums
  are sourced from the Drizzle `pgEnum.enumValues` tuple, never duplicated.
  Routers expose `availableActions` on entity outputs so the FE renders
  buttons without importing the machine. See
  [`packages/backend/src/domain/bill/`](./packages/backend/src/domain/bill/)
  for the pattern.
- **Validation: Drizzle is the column-shape source of truth.** Zod schemas
  are derived via `drizzle-zod`'s `createInsertSchema(...)` /
  `createSelectSchema(...)` rather than hand-written. Domain rules above
  the DB level (whitespace-only strings, decimal regex, totals
  reconciliation) layer on top as Zod refinements. **No parallel
  hand-written validators.** Adding a column to a Drizzle table flows
  through to the Zod schema automatically — no second edit needed.
  Reference: [`domain/bill/schemas.ts`](./packages/backend/src/domain/bill/schemas.ts).
- **No parent-relative imports.** Use the workspace package name
  (`@vamp-bills/backend/...`, `@workspace/ui/...`) for any cross-directory
  import — same syntax for self-imports inside a package and for imports
  from another package. Each package's `package.json#exports` map
  publishes its `src/` so the alias works without tsconfig `paths` or
  bundler plugins. Sibling imports (`./xxx.ts`) are fine — they don't
  cross module boundaries. Enforced as a hard `no-restricted-imports`
  error in `eslint.config.base.mjs` (same posture as the `any` ban).
- **No barrel `index.ts` re-exports.** Direct file imports beat
  pass-through index files: locality (the import path tells you which
  file the symbol lives in), no double-source-of-truth, no name drift.
  Deletion test as the heuristic — if removing the barrel just moves
  the import statements unchanged, the barrel was earning nothing.
- **tRPC error envelope.** Domain `missingPaths` (from
  `domain/bill/schemas.ts`) flow to the FE via the `errorFormatter`
  registered in [`packages/backend/src/trpc/trpc.ts`](./packages/backend/src/trpc/trpc.ts):
  throw `TRPCError({ code: "BAD_REQUEST", cause: new GuardFailedError(paths) })`
  and the FE reads them off `error.data.missingPaths`. Lifecycle
  mutations return the hydrated bill shape directly (built inline in
  `routers/bills.ts` via the local `hydrate()` helper), **never via
  `createCaller`** — invoking `createCaller` inside a procedure re-runs
  middleware and re-validates input (`@trpc/server#server-side-calls`
  skill, HIGH-severity gotcha).
- **tRPC Skills via `@tanstack/intent`.** The repo is intent-enabled
  for `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`,
  `@tanstack/router-core`, `@tanstack/router-plugin`, `dotenv`, and
  `@tanstack/devtools-event-client`. Before designing in any of those
  surfaces, run `npx @tanstack/intent@latest list` and load the
  matching skill (`load <pkg>#<skill>`) so the implementing session
  picks up the version-specific gotchas. PR descriptions should cite
  the skills consulted.

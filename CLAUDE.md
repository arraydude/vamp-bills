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
inference is fighting you for no real safety gain, or a code-generation
output (e.g., `routeTree.gen.ts` — already in eslint ignores).

Never acceptable: "I don't feel like typing it", "the inference is hard",
"it's just temporary".

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

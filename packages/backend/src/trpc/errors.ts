// Typed error carriers for tRPC `cause`. Pattern lifted from the
// `@trpc/server#error-handling` skill: `errorFormatter` reads `error.cause`
// via `instanceof` and lifts structured fields onto `error.data`. Subclassing
// `Error` keeps `cause` discoverable without smuggling untyped objects through
// the boundary.

export class GuardFailedError extends Error {
  readonly missingPaths: readonly string[];
  constructor(missingPaths: readonly string[]) {
    super("bill_not_ready");
    this.name = "GuardFailedError";
    this.missingPaths = missingPaths;
  }
}

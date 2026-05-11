export class GuardFailedError extends Error {
  readonly missingPaths: readonly string[];
  constructor(missingPaths: readonly string[]) {
    super("bill_not_ready");
    this.name = "GuardFailedError";
    this.missingPaths = missingPaths;
  }
}

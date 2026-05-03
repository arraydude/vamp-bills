// Shared ESLint config for every workspace package.
// Per-package eslint.config.mjs imports this base and extends with React-specific
// or package-specific rules. The base file path resolves relative to each package.
//
// Why a function (not a flat array): tseslint.configs.recommended is read at
// import time and we want each package to register its own files glob, ignores,
// and tsconfigRootDir so type-aware rules resolve against the right project.

import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * @param {object} opts
 * @param {string} opts.tsconfigRootDir - typically `import.meta.dirname` from caller
 * @param {string[]} [opts.files] - file globs the package-specific rules apply to
 * @param {string[]} [opts.extraIgnores] - additional ignore globs (added to defaults)
 */
export function createBaseConfig({
  tsconfigRootDir,
  files = ["src/**/*.{ts,tsx}"],
  extraIgnores = [],
}) {
  return tseslint.config(
    {
      ignores: ["dist/**", "node_modules/**", "**/*.config.{js,mjs,ts}", ...extraIgnores],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      files,
      languageOptions: {
        parserOptions: { tsconfigRootDir },
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            destructuredArrayIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
          },
        ],
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { prefer: "type-imports", fixStyle: "separate-type-imports" },
        ],
        // No `any` in source. Escape hatch: inline disable with a `--`
        // comment explaining why. See CLAUDE.md.
        "@typescript-eslint/no-explicit-any": "error",
        // Discourage parent-relative imports. Prefer absolute paths via
        // package-local TS path aliases (e.g. `@vamp-bills/backend/...`
        // mapped via tsconfig `paths`) or workspace package imports.
        // Sibling `./xxx.ts` is fine. Set to `warn` so it surfaces as
        // editor squiggles + CI warning without blocking merge — a
        // nudge, not a wall.
        "no-restricted-imports": [
          "warn",
          {
            patterns: [
              {
                group: ["../*", "../**"],
                message:
                  "Prefer absolute imports: package-local TS path aliases (e.g. `@vamp-bills/backend/...`) or workspace packages (`@vamp-bills/...`, `@workspace/...`). Sibling imports (`./xxx.ts`) are fine.",
              },
            ],
          },
        ],
      },
      linterOptions: { reportUnusedDisableDirectives: "error" },
    },
  );
}

import js from "@eslint/js";
import tseslint from "typescript-eslint";

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
        "@typescript-eslint/no-explicit-any": "error",
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["../*", "../**"],
                message:
                  "Parent-relative imports are forbidden. Use the workspace package name (`@vamp-bills/backend/...`, `@workspace/ui/...`) or sibling imports (`./xxx.ts`).",
              },
            ],
          },
        ],
      },
      linterOptions: { reportUnusedDisableDirectives: "error" },
    },
  );
}

import js from "@eslint/js";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// React-specific rules are split across plugins:
// - eslint-plugin-react-hooks: rules-of-hooks + exhaustive-deps (irreplaceable)
// - eslint-plugin-react-compiler: flags patterns the React Compiler can't optimize
// We deliberately skip eslint-plugin-react (most rules are stylistic and overlap
// with Biome; its current stable version isn't ESLint 10-compatible anyway).
export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "**/*.config.{js,mjs,ts}", "vite.config.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat["recommended-latest"],
  reactCompiler.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
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
    },
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
);

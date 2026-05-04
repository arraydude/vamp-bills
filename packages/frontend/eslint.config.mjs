import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import { createBaseConfig } from "../../eslint.config.base.mjs";

// React-specific rules are split across plugins:
// - eslint-plugin-react-hooks: rules-of-hooks + exhaustive-deps (irreplaceable)
// - eslint-plugin-react-compiler: flags patterns the React Compiler can't optimize
// We deliberately skip eslint-plugin-react (most rules are stylistic and overlap
// with Biome; its current stable version isn't ESLint 10-compatible anyway).
export default [
  ...createBaseConfig({
    tsconfigRootDir: import.meta.dirname,
    extraIgnores: ["vite.config.ts"],
  }),
  reactHooks.configs.flat["recommended-latest"],
  reactCompiler.configs.recommended,
];

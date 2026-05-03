import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import { createBaseConfig } from "../../eslint.config.base.mjs";

// React-specific rules layered on top of the base. Same plugin set as frontend
// (rationale documented there): typescript-eslint + react-hooks v7 +
// react-compiler. Skips eslint-plugin-react (overlaps with Biome; current
// stable v7.37 isn't ESLint 10-compatible).
export default [
  ...createBaseConfig({ tsconfigRootDir: import.meta.dirname }),
  reactHooks.configs.flat["recommended-latest"],
  reactCompiler.configs.recommended,
];

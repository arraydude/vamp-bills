import { createBaseConfig } from "../../eslint.config.base.mjs";

export default createBaseConfig({
  tsconfigRootDir: import.meta.dirname,
  files: ["src/**/*.ts"],
  extraIgnores: ["drizzle/**"],
});

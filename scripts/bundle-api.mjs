import { build } from "esbuild";

await build({
  entryPoints: ["api/_entry.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "api/_bundle.mjs",
  external: ["pg-native", "better-sqlite3"],
  packages: "bundle",
  sourcemap: true,
  banner: {
    js: `import { createRequire } from "module"; const require = createRequire(import.meta.url);`,
  },
});

console.log("✓ api/_bundle.mjs bundled");

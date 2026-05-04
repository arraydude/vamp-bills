import { build } from "esbuild";

await build({
  entryPoints: ["api-src/index.ts"],
  outfile: ".vercel-build/api/index.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node24",
  sourcemap: true,
  legalComments: "none",
  logLevel: "info",
});

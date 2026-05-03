import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // React Compiler runs as a standalone Babel pass.
    // Vite 8's @vitejs/plugin-react v6 moved its own React Refresh transform to
    // Oxc and dropped the `babel` option, so we run the compiler separately.
    // The TypeScript preset is needed because Babel's parser does not understand
    // TS syntax (e.g. non-null assertions) on its own.
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: [["@babel/preset-typescript", { isTSX: true, allExtensions: true }]],
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

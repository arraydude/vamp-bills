import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // React Compiler runs as a standalone Babel pass. @vitejs/plugin-react v6
    // ships `reactCompilerPreset` for use with @rolldown/plugin-babel — it handles
    // the TS preset + rolldown file filter internally, so we just pass it through.
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  // Vite 8 reads `paths` from tsconfig directly, so no manual `resolve.alias`.
  resolve: {
    tsconfigPaths: true,
  },
});

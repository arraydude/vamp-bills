import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Router plugin must run before react() so the generated route imports
    // are rewritten before React's Babel pass touches them.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
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
  // Same-origin proxy to the backend on :3000 in dev. Phase 5 (Vercel) will
  // route via vercel.json rewrites instead.
  server: {
    proxy: {
      "/trpc": { target: "http://localhost:3000", changeOrigin: true },
      "/api/auth": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});

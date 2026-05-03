import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Component showcase dev server. Not a published artifact — only here to give
// design-system a place to render every installed shadcn primitive in isolation
// from the frontend's tRPC/router/auth wiring.
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 5174,
    strictPort: false,
  },
});

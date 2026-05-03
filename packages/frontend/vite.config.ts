import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/

// React Compiler runs as a standalone Babel pass via @rolldown/plugin-babel
// (the Rolldown-native equivalent of vite-plugin-babel, recommended by Vite 8's
// migration guide). @vitejs/plugin-react v6 moved React Refresh to Oxc and
// dropped its own `babel` option, so the compiler can no longer hitchhike there.
// @babel/preset-typescript is needed because Babel's parser does not speak TS
// (non-null assertions, etc.) on its own.
function reactCompilerPreset() {
  return {
    preset: () => ({
      presets: [["@babel/preset-typescript", { isTSX: true, allExtensions: true }]],
      plugins: ["babel-plugin-react-compiler"],
    }),
    rolldown: {
      filter: {
        id: /\.[jt]sx?$/,
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  // Vite 8 reads `paths` from tsconfig directly, so no manual `resolve.alias`.
  resolve: {
    tsconfigPaths: true,
  },
});

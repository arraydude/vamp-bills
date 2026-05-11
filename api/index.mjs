// Vercel serverless function entry — committed to git so Vercel detects it.
// The real implementation is bundled into _bundle.mjs by scripts/bundle-api.mjs
// during the buildCommand. esbuild inlines all deps, eliminating pnpm symlink
// issues with Vercel's NFT tracer.
export { default } from "./_bundle.mjs";

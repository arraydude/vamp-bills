// Vercel serverless entry.
//
// This is intentionally not Vercel's preferred "Node app as the whole project"
// shape. For this take-home demo we keep a single Vercel project that serves
// the Vite SPA statically and rewrites `/trpc/*` + `/api/auth/*` to this Express
// function. The more canonical alternatives are either two Vercel projects
// (frontend + backend) or one Express app that serves the built SPA itself.
// Both add deployment surface we do not need for the demo.
//
// Vercel's Node runtime accepts an Express app as the default export and invokes
// it as `(req, res) => app(req, res)`.
// We import the backend's createApp() factory directly via relative path —
// Vercel's tsc compiles api/ standalone and doesn't have the workspace
// package alias on its resolution path, so the named `@vamp-bills/backend/app`
// import doesn't resolve at build time. The relative path includes .ts
// extension (verbatimModuleSyntax + NodeNext require it).
import { createApp } from "../packages/backend/src/app.ts";

export default createApp();

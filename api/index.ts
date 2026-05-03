// Vercel serverless entry. Vercel's Node runtime accepts an Express app as
// the default export and invokes it as `(req, res) => app(req, res)`.
// We import the backend's createApp() factory directly via relative path —
// Vercel's tsc compiles api/ standalone and doesn't have the workspace
// package alias on its resolution path, so the named `@vamp-bills/backend/app`
// import doesn't resolve at build time. The relative path includes .ts
// extension (verbatimModuleSyntax + NodeNext require it).
import { createApp } from "../packages/backend/src/app.ts";

export default createApp();

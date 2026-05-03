// Vercel serverless entry. Vercel's Node runtime accepts an Express app as
// the default export and invokes it as `(req, res) => app(req, res)`.
// Backend lives in @vamp-bills/backend; we import its createApp() factory
// (not the dev-mode src/index.ts which calls app.listen).
import { createApp } from "@vamp-bills/backend/app";

export default createApp();

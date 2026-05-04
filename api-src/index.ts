// Vercel serverless entry source.
//
// The generated function lives at api/index.js. Keep this source outside /api
// so Vercel does not create an extra function for it.
import { createApp } from "../packages/backend/src/app.ts";

export default createApp();

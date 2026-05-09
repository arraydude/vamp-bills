import { createAuthClient } from "better-auth/react";

// Same-origin baseURL — proxy forwards /api/auth → http://localhost:3000.
// No `credentials: 'include'` needed because the browser sees a same-origin
// request; cookies attach automatically. BetterAuth's client constructor
// requires an absolute URL; resolve against `window.location.origin` at
// import time (SSR fallback retained for completeness — this app is CSR).
const baseURL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : "http://localhost:5178/api/auth";

export const authClient = createAuthClient({ baseURL });

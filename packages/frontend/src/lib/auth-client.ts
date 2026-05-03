import { createAuthClient } from "better-auth/react";

// Same-origin baseURL — proxy forwards /api/auth → http://localhost:3000.
// No `credentials: 'include'` needed because the browser sees a same-origin
// request; cookies attach automatically.
export const authClient = createAuthClient({ baseURL: "/api/auth" });

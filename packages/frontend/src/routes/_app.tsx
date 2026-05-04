import { createRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell/app-shell.tsx";
import { authClient } from "@/lib/auth-client.ts";
import { rootRoute } from "@/routes/root.tsx";

export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_app",
  component: AppShell,
  beforeLoad: async ({ context, location }) => {
    let authenticated = !!context.auth.data;
    if (!authenticated) {
      const { data } = await authClient.getSession();
      authenticated = !!data;
    }
    if (!authenticated) {
      throw redirect({ to: "/login", search: { redirect: location.pathname } });
    }
  },
});

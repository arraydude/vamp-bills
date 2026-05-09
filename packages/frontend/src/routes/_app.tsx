import { createRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell/app-shell.tsx";
import { rootRoute } from "@/routes/root.tsx";

export const appLayoutProtectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_app",
  component: AppShell,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.data) {
      throw redirect({ to: "/login", search: { redirect: location.pathname } });
    }
  },
});

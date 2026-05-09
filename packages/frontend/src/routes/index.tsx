import { createRoute, redirect } from "@tanstack/react-router";

import { appLayoutProtectedRoute } from "@/routes/_app.tsx";

export const indexRoute = createRoute({
  getParentRoute: () => appLayoutProtectedRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/bills" });
  },
});

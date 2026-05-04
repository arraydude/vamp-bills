import { createRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell/app-shell.tsx";
import { rootRoute } from "@/routes/root.tsx";

export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_app",
  component: AppShell,
});

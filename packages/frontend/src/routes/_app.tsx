import { createRoute, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppShell } from "@/components/app-shell/app-shell.tsx";
import { authClient } from "@/lib/auth-client.ts";
import { rootRoute } from "@/routes/root.tsx";

export const appLayoutProtectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_app",
  component: ProtectedAppShell,
  beforeLoad: ({ context, location }) => {
    if (context.auth.isPending) return;
    if (!context.auth.data) {
      throw redirect({ to: "/login", search: { redirect: location.pathname } });
    }
  },
});

function ProtectedAppShell() {
  const { data, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isPending && !data) {
      void navigate({ to: "/login", search: { redirect: pathname } });
    }
  }, [isPending, data, navigate, pathname]);

  if (isPending || !data) return null;
  return <AppShell />;
}

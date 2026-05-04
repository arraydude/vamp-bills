import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

type SessionState = {
  data: { session: Record<string, unknown>; user: Record<string, unknown> } | null;
  isPending: boolean;
  error: { message: string } | null;
};

export type RouterContext = {
  auth: SessionState;
};

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

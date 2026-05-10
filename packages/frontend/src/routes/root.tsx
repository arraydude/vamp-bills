import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    getTitle?: () => string;
  }
}

type SessionData = {
  session: Record<string, unknown>;
  user: Record<string, unknown>;
};

export type RouterContext = {
  auth: {
    data: SessionData | null;
    isPending: boolean;
  };
};

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

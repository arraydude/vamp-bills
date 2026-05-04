import { createRouter } from "@tanstack/react-router";
import { appLayoutRoute } from "@/routes/_app.tsx";
import { billDetailRoute } from "@/routes/bill-detail.tsx";
import { billNewRoute } from "@/routes/bill-new.tsx";
import { billsRoute } from "@/routes/bills.tsx";
import { indexRoute } from "@/routes/index.tsx";
import { loginRoute } from "@/routes/login.tsx";
import type { RouterContext } from "@/routes/root.tsx";
import { rootRoute } from "@/routes/root.tsx";

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appLayoutRoute.addChildren([billsRoute, billNewRoute, billDetailRoute]),
]);

export const router = createRouter({
  routeTree,
  context: { auth: { data: null, isPending: true } } satisfies RouterContext,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

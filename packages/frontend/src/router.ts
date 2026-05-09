import { createRouter } from "@tanstack/react-router";
import { appLayoutProtectedRoute } from "@/routes/_app.tsx";
import { billDetailRoute } from "@/routes/bill-detail.tsx";
import { billNewRoute } from "@/routes/bill-new.tsx";
import { billsIndexRoute, billsRoute } from "@/routes/bills.tsx";
import { indexRoute } from "@/routes/index.tsx";
import { loginRoute } from "@/routes/login.tsx";
import type { RouterContext } from "@/routes/root.tsx";
import { rootRoute } from "@/routes/root.tsx";
import { vendorsIndexRoute, vendorsRoute } from "@/routes/vendors.tsx";

const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutProtectedRoute.addChildren([
    indexRoute,
    billsRoute.addChildren([billsIndexRoute, billNewRoute, billDetailRoute]),
    vendorsRoute.addChildren([vendorsIndexRoute]),
  ]),
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

import { createRouter } from "@tanstack/react-router";

import { appLayoutRoute } from "@/routes/_app.tsx";
import { billsRoute } from "@/routes/bills.tsx";
import { indexRoute } from "@/routes/index.tsx";
import { rootRoute } from "@/routes/root.tsx";

const routeTree = rootRoute.addChildren([indexRoute, appLayoutRoute.addChildren([billsRoute])]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

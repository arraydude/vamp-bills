import { createRoute } from "@tanstack/react-router";

import { BillPage } from "@/components/bills/bill-page.tsx";
import { appLayoutRoute } from "@/routes/_app.tsx";

export const billNewRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/bills/new",
  component: () => <BillPage bill={null} />,
});

import { createRoute } from "@tanstack/react-router";

import { BillPage } from "@/components/bills/bill-page.tsx";
import { billsRoute } from "@/routes/bills.tsx";

export const billNewRoute = createRoute({
  getParentRoute: () => billsRoute,
  path: "/new",
  staticData: { getTitle: () => "New Bill" },
  component: () => <BillPage bill={null} />,
});

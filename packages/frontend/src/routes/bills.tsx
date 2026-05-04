import { createRoute } from "@tanstack/react-router";

import { appLayoutRoute } from "@/routes/_app.tsx";

export const billsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/bills",
  component: BillsPage,
});

function BillsPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Bills</h1>
      <p className="text-muted-foreground text-sm">Bills list ships in a follow-up PR.</p>
    </div>
  );
}

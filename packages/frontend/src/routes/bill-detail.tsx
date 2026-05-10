import { createRoute } from "@tanstack/react-router";

import { useBillById } from "@/api/bills/queries.ts";
import { BillPage } from "@/components/bills/bill-page.tsx";
import { BillPageSkeleton } from "@/components/bills/bill-page-skeleton.tsx";
import { billsRoute } from "@/routes/bills.tsx";

export const billDetailRoute = createRoute({
  getParentRoute: () => billsRoute,
  path: "/$billId",
  staticData: { getTitle: () => "Bill Details" },
  component: BillDetailPage,
});

function BillDetailPage() {
  const { billId } = billDetailRoute.useParams();
  const { data, isLoading, error } = useBillById(billId);

  if (isLoading) return <BillPageSkeleton />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <p>Bill not found</p>
      </div>
    );
  }

  return <BillPage bill={data} />;
}

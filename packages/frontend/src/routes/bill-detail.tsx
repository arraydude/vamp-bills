import { createRoute } from "@tanstack/react-router";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { useBillById } from "@/api/bills/queries.ts";
import { BillPage } from "@/components/bills/bill-page.tsx";
import { billsRoute } from "@/routes/bills.tsx";

export const billDetailRoute = createRoute({
  getParentRoute: () => billsRoute,
  path: "/$billId",
  component: BillDetailPage,
});

function BillDetailPage() {
  const { billId } = billDetailRoute.useParams();
  const { data, isLoading, error } = useBillById(billId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-16" />
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-24" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-32" />
          </div>
          <div className="w-full shrink-0 md:w-72">
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <p>Bill not found</p>
      </div>
    );
  }

  return <BillPage bill={data} />;
}

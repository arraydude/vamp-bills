import { IconAlertTriangle, IconCircleCheck, IconClock, IconReceipt } from "@tabler/icons-react";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { useBillsSummary } from "@/api/bills/queries.ts";

const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function fmt(value: number): string {
  return value >= 100_000 ? usdCompact.format(value) : usdFormat.format(value);
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

const gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
const cardBgGradient = "bg-linear-to-t from-primary/5 to-card";

function MetricSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </CardFooter>
    </Card>
  );
}

export function BillsMetrics() {
  const { data, isLoading } = useBillsSummary();

  if (isLoading || !data) {
    return (
      <div className={`grid ${gridCols} gap-4 *:data-[slot=card]:shadow-xs`}>
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>
    );
  }

  const hasOverdue = data.overdueCount > 0;

  return (
    <div
      className={`grid ${gridCols} gap-4 *:data-[slot=card]:${cardBgGradient} *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card`}
    >
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Paid</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {fmt(data.paidTotal)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCircleCheck className="text-chart-1" />
              {plural(data.paidCount, "bill")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Settled and complete <IconCircleCheck className="size-4 text-chart-1" />
          </div>
          <div className="text-muted-foreground">All time paid bills</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Outstanding</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {fmt(data.outstandingTotal)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconClock />
              {plural(data.outstandingCount, "bill")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.pendingApprovalCount > 0
              ? `${plural(data.pendingApprovalCount, "bill")} pending approval`
              : "All bills approved"}
            <IconClock className="size-4" />
          </div>
          <div className="text-muted-foreground">Awaiting approval or payment</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Overdue</CardDescription>
          <CardTitle
            className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${hasOverdue ? "text-destructive" : ""}`}
          >
            {fmt(data.overdueTotal)}
          </CardTitle>
          <CardAction>
            <Badge variant={hasOverdue ? "destructive" : "outline"}>
              <IconAlertTriangle />
              {plural(data.overdueCount, "bill")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {hasOverdue ? "Requires immediate attention" : "No overdue bills"}
            <IconAlertTriangle className={`size-4 ${hasOverdue ? "text-destructive" : ""}`} />
          </div>
          <div className="text-muted-foreground">Bills past their due date</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg. Bill</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {fmt(data.avgAmount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconReceipt />
              {plural(data.totalCount, "bill")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Average across all bills <IconReceipt className="size-4" />
          </div>
          <div className="text-muted-foreground">Based on {data.totalCount} total bills</div>
        </CardFooter>
      </Card>
    </div>
  );
}

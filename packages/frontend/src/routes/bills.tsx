import { IconPlus, IconSearch, IconUpload } from "@tabler/icons-react";
import { createRoute, Outlet, useNavigate } from "@tanstack/react-router";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useState } from "react";
import { z } from "zod";
import { useBillsCounts, useBillsList } from "@/api/bills/queries.ts";
import { columns } from "@/components/bills/bills-columns.tsx";
import type { TabValue } from "@/components/bills/bills-empty-state.tsx";
import { BillsMetrics } from "@/components/bills/bills-metrics.tsx";
import { BillsTable } from "@/components/bills/bills-table.tsx";
import { CsvUploadDialog } from "@/components/bills/csv-upload-dialog.tsx";
import { appLayoutProtectedRoute } from "@/routes/_app.tsx";

const billsSearchSchema = z.object({
  tab: z
    .enum(["drafts", "awaiting_approval", "awaiting_payment", "history"])
    .optional()
    .catch(undefined),
});

const TAB_STATUS_MAP = {
  drafts: ["draft"],
  awaiting_approval: ["awaiting_approval"],
  awaiting_payment: ["approved"],
  history: ["paid", "archived"],
} as const;

const TAB_LABELS: Record<TabValue, string> = {
  drafts: "Drafts",
  awaiting_approval: "Awaiting Approval",
  awaiting_payment: "Awaiting Payment",
  history: "History",
};

export const billsRoute = createRoute({
  getParentRoute: () => appLayoutProtectedRoute,
  path: "/bills",
  component: () => <Outlet />,
});

export const billsIndexRoute = createRoute({
  getParentRoute: () => billsRoute,
  path: "/",
  validateSearch: (search): z.output<typeof billsSearchSchema> => billsSearchSchema.parse(search),
  component: BillsPage,
});

function BillsPage() {
  const { tab = "drafts" } = billsIndexRoute.useSearch();
  const navigate = useNavigate({ from: billsIndexRoute.fullPath });

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [csvOpen, setCsvOpen] = useState(false);

  const { data, isLoading } = useBillsList({ status: [...TAB_STATUS_MAP[tab]] });
  const statusCounts = useBillsCounts();

  // eslint-disable-next-line react-hooks/incompatible-library -- table instance is consumed within this component only; compiler already skips memoization
  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.toLowerCase();
      const vendor = (row.original.vendorName ?? "").toLowerCase();
      const invoice = row.original.invoiceNumber.toLowerCase();
      return vendor.includes(q) || invoice.includes(q);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Bills</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCsvOpen(true)}>
            <IconUpload className="size-4" />
            Import CSV
          </Button>
          <Button size="sm" onClick={() => navigate({ to: "/bills/new" })}>
            <IconPlus className="size-4" />
            New bill
          </Button>
        </div>
      </div>

      <BillsMetrics />

      <Tabs
        value={tab}
        onValueChange={(newTab) => navigate({ search: { tab: newTab as TabValue } })}
      >
        <TabsList variant="line">
          {(Object.keys(TAB_LABELS) as TabValue[]).map((key) => {
            const count = TAB_STATUS_MAP[key].reduce((sum, s) => sum + (statusCounts[s] ?? 0), 0);
            return (
              <TabsTrigger key={key} value={key}>
                {TAB_LABELS[key]}
                <Badge variant="secondary" className="ml-1.5 tabular-nums">
                  {isLoading ? <Skeleton className="size-2" /> : count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="relative max-w-sm">
        <IconSearch className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by vendor or invoice #…"
          className="pl-9"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

      <BillsTable
        table={table}
        tab={tab}
        isLoading={isLoading}
        onRowClick={(id) => navigate({ to: "/bills/$billId", params: { billId: id } })}
      />

      {csvOpen && <CsvUploadDialog onOpenChange={setCsvOpen} />}
    </div>
  );
}

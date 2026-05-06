import { IconPlus, IconSearch } from "@tabler/icons-react";
import { createRoute, Outlet, useNavigate } from "@tanstack/react-router";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useState } from "react";
import { z } from "zod";

import { useBillsList } from "@/api/bills/queries.ts";
import { columns } from "@/components/bills/bills-columns.tsx";
import type { TabValue } from "@/components/bills/bills-empty-state.tsx";
import { BillsTable } from "@/components/bills/bills-table.tsx";
import { appLayoutRoute } from "@/routes/_app.tsx";

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
  getParentRoute: () => appLayoutRoute,
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

  const { data, isLoading } = useBillsList({ status: [...TAB_STATUS_MAP[tab]] });

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
        <Button size="sm" onClick={() => navigate({ to: "/bills/new" })}>
          <IconPlus className="size-4" />
          New bill
        </Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(newTab) => navigate({ search: { tab: newTab as TabValue } })}
      >
        <TabsList variant="line">
          {(Object.keys(TAB_LABELS) as TabValue[]).map((key) => (
            <TabsTrigger key={key} value={key}>
              {TAB_LABELS[key]}
            </TabsTrigger>
          ))}
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
    </div>
  );
}

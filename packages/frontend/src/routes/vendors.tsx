import { IconPlus, IconSearch } from "@tabler/icons-react";
import { createRoute, Outlet } from "@tanstack/react-router";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useState } from "react";
import type { VendorListItem } from "@/api/vendors/queries.ts";
import { useVendorsList } from "@/api/vendors/queries.ts";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog.tsx";
import { columns } from "@/components/vendors/vendors-columns.tsx";
import { VendorsTable } from "@/components/vendors/vendors-table.tsx";
import { appLayoutProtectedRoute } from "@/routes/_app.tsx";

export const vendorsRoute = createRoute({
  getParentRoute: () => appLayoutProtectedRoute,
  path: "/vendors",
  staticData: { getTitle: () => "Vendors" },
  component: () => <Outlet />,
});

export const vendorsIndexRoute = createRoute({
  getParentRoute: () => vendorsRoute,
  path: "/",
  component: VendorsPage,
});

function VendorsPage() {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorListItem | null>(null);

  const { data, isLoading } = useVendorsList();

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
      return (
        row.original.name.toLowerCase().includes(q) || row.original.email.toLowerCase().includes(q)
      );
    },
  });

  const handleNewVendor = () => {
    setEditingVendor(null);
    setDialogOpen(true);
  };

  const handleRowClick = (id: string) => {
    const vendor = data?.find((v) => v.id === id) ?? null;
    setEditingVendor(vendor);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
        <Button size="sm" onClick={handleNewVendor}>
          <IconPlus className="size-4" />
          New vendor
        </Button>
      </div>

      <div className="relative max-w-sm">
        <IconSearch className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

      <VendorsTable table={table} isLoading={isLoading} onRowClick={handleRowClick} />

      {dialogOpen && <VendorFormDialog open onOpenChange={setDialogOpen} vendor={editingVendor} />}
    </div>
  );
}

"use no memo";

import { IconSearch } from "@tabler/icons-react";
import { createRoute, Outlet } from "@tanstack/react-router";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@workspace/ui/components/input";
import { useState } from "react";

import { useUsersList } from "@/api/users/queries.ts";
import { columns } from "@/components/users/users-columns.tsx";
import { UsersTable } from "@/components/users/users-table.tsx";
import { appLayoutProtectedRoute } from "@/routes/_app.tsx";

export const usersRoute = createRoute({
  getParentRoute: () => appLayoutProtectedRoute,
  path: "/users",
  staticData: { getTitle: () => "Users" },
  component: () => <Outlet />,
});

export const usersIndexRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "/",
  component: UsersPage,
});

function UsersPage() {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading } = useUsersList();

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
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

      <UsersTable table={table} isLoading={isLoading} />
    </div>
  );
}

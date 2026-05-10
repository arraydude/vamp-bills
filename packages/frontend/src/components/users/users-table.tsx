import { IconSearch, IconUsersGroup } from "@tabler/icons-react";
import { flexRender, type Table } from "@tanstack/react-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from "@workspace/ui/components/table";

import type { UserListItem } from "@/api/users/queries.ts";

export function UsersTable({
  table,
  isLoading,
}: {
  table: Table<UserListItem>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  const rows = table.getRowModel().rows;
  const hasData = (table.options.data?.length ?? 0) > 0;

  if (rows.length === 0) {
    if (hasData) {
      return <NoResults />;
    }
    return <UsersEmptyState />;
  }

  return (
    <UITable>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </UITable>
  );
}

function NoResults() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconSearch />
        </EmptyMedia>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>No users match your search. Try a different query.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function UsersEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconUsersGroup />
        </EmptyMedia>
        <EmptyTitle>No users yet</EmptyTitle>
        <EmptyDescription>Users will appear here once they sign up.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 pt-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

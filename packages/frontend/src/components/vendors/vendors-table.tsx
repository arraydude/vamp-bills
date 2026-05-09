import { IconSearch, IconUsers } from "@tabler/icons-react";
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

import type { VendorListItem } from "@/api/vendors/queries.ts";

export function VendorsTable({
  table,
  isLoading,
  onRowClick,
}: {
  table: Table<VendorListItem>;
  isLoading: boolean;
  onRowClick?: (id: string) => void;
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
    return <VendorsEmptyState />;
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
          <TableRow
            key={row.id}
            className={onRowClick ? "cursor-pointer" : ""}
            onClick={onRowClick ? () => onRowClick(row.original.id) : undefined}
          >
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
        <EmptyDescription>No vendors match your search. Try a different query.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function VendorsEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconUsers />
        </EmptyMedia>
        <EmptyTitle>No vendors yet</EmptyTitle>
        <EmptyDescription>
          Create a vendor to start tracking your bills and payments.
        </EmptyDescription>
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

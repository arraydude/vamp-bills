import { flexRender, type Table } from "@tanstack/react-table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from "@workspace/ui/components/table";

import type { BillListItem } from "@/components/bills/bills-columns.tsx";
import { BillsEmptyState, type TabValue } from "@/components/bills/bills-empty-state.tsx";

export function BillsTable({
  table,
  tab,
  isLoading,
  onRowClick,
}: {
  table: Table<BillListItem>;
  tab: TabValue;
  isLoading: boolean;
  onRowClick?: (id: string) => void;
}) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return <BillsEmptyState tab={tab} />;
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

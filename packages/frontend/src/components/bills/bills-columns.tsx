import { IconArrowDown, IconArrowUp, IconSelector } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";
import { compareAsc, format, parse, parseISO } from "date-fns";

import { StatusBadge } from "@/components/bills/status-badge.tsx";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type BillListItem = RouterOutputs["bills"]["list"][number];

function parseDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? parse(value, "yyyy-MM-dd", new Date())
    : parseISO(value);
}

const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <IconArrowUp className="size-3.5" />;
  if (sorted === "desc") return <IconArrowDown className="size-3.5" />;
  return <IconSelector className="size-3.5 opacity-40" />;
}

export const columns: ColumnDef<BillListItem, unknown>[] = [
  {
    accessorKey: "vendorName",
    header: ({ column }) => (
      <button
        type="button"
        className="flex items-center gap-1"
        onClick={column.getToggleSortingHandler()}
      >
        Vendor
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => row.original.vendorName ?? "Unknown vendor",
  },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    enableSorting: false,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <div className="text-end">
        <button
          type="button"
          className="inline-flex items-center gap-1"
          onClick={column.getToggleSortingHandler()}
        >
          Amount
          <SortIcon sorted={column.getIsSorted()} />
        </button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-end tabular-nums">
        {usdFormat.format(Number(row.original.totalAmount))}
      </div>
    ),
    sortingFn: (a, b, columnId) => Number(a.getValue(columnId)) - Number(b.getValue(columnId)),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <button
        type="button"
        className="flex items-center gap-1"
        onClick={column.getToggleSortingHandler()}
      >
        Due Date
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) =>
      row.original.dueDate ? format(parseDate(row.original.dueDate), "MMM d, yyyy") : "—",
    sortingFn: (a, b, columnId) => {
      const dateA = a.getValue<string | null>(columnId);
      const dateB = b.getValue<string | null>(columnId);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return compareAsc(parseDate(dateA), parseDate(dateB));
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(parseDate(row.original.createdAt), "MMM d, yyyy"),
    enableSorting: false,
  },
];

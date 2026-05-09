import { IconArrowDown, IconArrowUp, IconSelector } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";

import type { VendorListItem } from "@/api/vendors/queries.ts";

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <IconArrowUp className="size-3.5" />;
  if (sorted === "desc") return <IconArrowDown className="size-3.5" />;
  return <IconSelector className="size-3.5 opacity-40" />;
}

export const columns: ColumnDef<VendorListItem, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button
        type="button"
        className="flex items-center gap-1"
        onClick={column.getToggleSortingHandler()}
      >
        Name
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <button
        type="button"
        className="flex items-center gap-1"
        onClick={column.getToggleSortingHandler()}
      >
        Email
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <button
        type="button"
        className="flex items-center gap-1"
        onClick={column.getToggleSortingHandler()}
      >
        Created
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => format(parseISO(row.original.createdAt), "MMM d, yyyy"),
    sortingFn: (a, b, columnId) => {
      const dateA = a.getValue<string>(columnId);
      const dateB = b.getValue<string>(columnId);
      return dateA.localeCompare(dateB);
    },
  },
];

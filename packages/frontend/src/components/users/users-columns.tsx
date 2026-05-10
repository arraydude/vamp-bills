import { IconArrowDown, IconArrowUp, IconSelector } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { format, parseISO } from "date-fns";

import type { UserListItem } from "@/api/users/queries.ts";

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <IconArrowUp className="size-3.5" />;
  if (sorted === "desc") return <IconArrowDown className="size-3.5" />;
  return <IconSelector className="size-3.5 opacity-40" />;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const columns: ColumnDef<UserListItem, unknown>[] = [
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
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar size="sm">
          {row.original.image && <AvatarImage src={row.original.image} alt={row.original.name} />}
          <AvatarFallback className="text-xs">{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <span>{row.original.name}</span>
      </div>
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
        Joined
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

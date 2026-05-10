import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { SortIcon } from "@workspace/ui/components/sort-icon";
import { getInitials } from "@workspace/ui/lib/format";
import { format } from "date-fns";

import type { UserListItem } from "@/api/users/queries.ts";

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
    enableGlobalFilter: false,
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
    cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    sortingFn: (a, b, columnId) => {
      const dateA = new Date(a.getValue<Date | string>(columnId)).getTime();
      const dateB = new Date(b.getValue<Date | string>(columnId)).getTime();
      return dateA - dateB;
    },
  },
];

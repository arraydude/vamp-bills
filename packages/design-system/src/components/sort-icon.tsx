import { IconArrowDown, IconArrowUp, IconSelector } from "@tabler/icons-react";

export function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <IconArrowUp className="size-3.5" />;
  if (sorted === "desc") return <IconArrowDown className="size-3.5" />;
  return <IconSelector className="size-3.5 opacity-40" />;
}

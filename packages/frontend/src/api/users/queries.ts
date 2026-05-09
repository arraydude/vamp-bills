import { useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";

import { useTRPC } from "@/lib/trpc.ts";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type UserListItem = RouterOutputs["users"]["list"][number];

export function useUsersList() {
  const trpc = useTRPC();
  return useQuery(trpc.users.list.queryOptions());
}

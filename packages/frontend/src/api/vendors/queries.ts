import { useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";

import { useTRPC } from "@/lib/trpc.ts";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type VendorListItem = RouterOutputs["vendors"]["list"][number];

export function useVendorsList() {
  const trpc = useTRPC();
  return useQuery(trpc.vendors.list.queryOptions());
}

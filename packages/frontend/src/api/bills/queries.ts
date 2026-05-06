import { useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";

import { useTRPC } from "@/lib/trpc.ts";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type BillListItem = RouterOutputs["bills"]["list"][number];
export type HydratedBill = RouterOutputs["bills"]["getById"];

export type BillStatus = BillListItem["status"];

export function useBillsList(filters: { status: readonly BillStatus[] }) {
  const trpc = useTRPC();
  return useQuery(
    trpc.bills.list.queryOptions({
      status: [...filters.status],
    }),
  );
}

export function useBillById(id: string) {
  const trpc = useTRPC();
  return useQuery(trpc.bills.getById.queryOptions({ id }));
}

export function useVendorsList() {
  const trpc = useTRPC();
  return useQuery(trpc.vendors.list.queryOptions());
}

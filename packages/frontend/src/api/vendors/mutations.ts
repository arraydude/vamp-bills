import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";
import { toast } from "sonner";

import { useTRPC } from "@/lib/trpc.ts";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Vendor = RouterOutputs["vendors"]["getById"];

type MutationCallbacks = {
  onSuccess?: (data: Vendor) => void;
  onError?: (error: unknown) => void;
};

function useVendorCacheUpdater() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return (data: Vendor) => {
    queryClient.setQueryData(trpc.vendors.getById.queryKey({ id: data.id }), data);
    void queryClient.invalidateQueries({ queryKey: trpc.vendors.list.queryKey() });
  };
}

export function useCreateVendor(opts?: MutationCallbacks) {
  const trpc = useTRPC();
  const updateCache = useVendorCacheUpdater();

  return useMutation(
    trpc.vendors.create.mutationOptions({
      onSuccess: (data) => {
        updateCache(data);
        toast.success("Vendor created");
        opts?.onSuccess?.(data);
      },
      onError: (error) => opts?.onError?.(error),
    }),
  );
}

export function useUpdateVendor(opts?: MutationCallbacks) {
  const trpc = useTRPC();
  const updateCache = useVendorCacheUpdater();

  return useMutation(
    trpc.vendors.update.mutationOptions({
      onSuccess: (data) => {
        updateCache(data);
        toast.success("Vendor updated");
        opts?.onSuccess?.(data);
      },
      onError: (error) => opts?.onError?.(error),
    }),
  );
}

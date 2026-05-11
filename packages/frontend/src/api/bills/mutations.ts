import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";
import { toast } from "sonner";

import { useTRPC } from "@/lib/trpc.ts";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type HydratedBill = RouterOutputs["bills"]["getById"];

type MutationCallbacks<TData = HydratedBill> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
};

function useBillCacheUpdater() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return (data: HydratedBill) => {
    queryClient.setQueryData(trpc.bills.getById.queryKey({ id: data.bill.id }), data);
    void queryClient.invalidateQueries({ queryKey: trpc.bills.list.queryKey() });
    void queryClient.invalidateQueries({ queryKey: trpc.bills.summary.queryKey() });
  };
}

export function useCreateBill(opts?: MutationCallbacks) {
  const trpc = useTRPC();
  const updateCache = useBillCacheUpdater();

  return useMutation(
    trpc.bills.create.mutationOptions({
      onSuccess: (data) => {
        updateCache(data);
        toast.success("Bill created");
        opts?.onSuccess?.(data);
      },
      onError: (error) => opts?.onError?.(error),
    }),
  );
}

export function useUpdateBill(opts?: MutationCallbacks) {
  const trpc = useTRPC();
  const updateCache = useBillCacheUpdater();

  return useMutation(
    trpc.bills.update.mutationOptions({
      onSuccess: (data) => {
        updateCache(data);
        toast.success("Bill saved");
        opts?.onSuccess?.(data);
      },
      onError: (error) => opts?.onError?.(error),
    }),
  );
}

function useLifecycleMutation(
  procedure: "submit" | "approve" | "reject" | "cancelPayment" | "archive",
  successMessage: string,
  opts?: MutationCallbacks,
) {
  const trpc = useTRPC();
  const updateCache = useBillCacheUpdater();

  return useMutation(
    trpc.bills[procedure].mutationOptions({
      onSuccess: (data) => {
        updateCache(data);
        toast.success(successMessage);
        opts?.onSuccess?.(data);
      },
      onError: (error) => opts?.onError?.(error),
    }),
  );
}

export function useSubmitBill(opts?: MutationCallbacks) {
  return useLifecycleMutation("submit", "Bill submitted for approval", opts);
}

export function useApproveBill(opts?: MutationCallbacks) {
  return useLifecycleMutation("approve", "Bill approved", opts);
}

export function useRejectBill(opts?: MutationCallbacks) {
  return useLifecycleMutation("reject", "Bill rejected", opts);
}

export function useMarkBillPaid(opts?: MutationCallbacks) {
  const trpc = useTRPC();
  const updateCache = useBillCacheUpdater();

  return useMutation(
    trpc.bills.markPaid.mutationOptions({
      onSuccess: (data) => {
        updateCache(data);
        toast.success("Bill marked as paid");
        opts?.onSuccess?.(data);
      },
      onError: (error) => opts?.onError?.(error),
    }),
  );
}

export function useCancelBillPayment(opts?: MutationCallbacks) {
  return useLifecycleMutation("cancelPayment", "Payment cancelled", opts);
}

export function useArchiveBill(opts?: MutationCallbacks) {
  return useLifecycleMutation("archive", "Bill archived", opts);
}

export type ExtractFromInvoiceResult = RouterOutputs["bills"]["extractFromInvoice"];

export function useExtractFromInvoice(opts?: MutationCallbacks<ExtractFromInvoiceResult>) {
  const trpc = useTRPC();

  return useMutation(
    trpc.bills.extractFromInvoice.mutationOptions({
      onSuccess: (data) => opts?.onSuccess?.(data),
      onError: (error) => {
        toast.error("Failed to extract invoice data");
        opts?.onError?.(error);
      },
    }),
  );
}

type ImportCsvResult = RouterOutputs["bills"]["importCsv"];

export function usePreviewCsv(opts?: MutationCallbacks<ImportCsvResult>) {
  const trpc = useTRPC();

  return useMutation(
    trpc.bills.importCsv.mutationOptions({
      onSuccess: (data) => opts?.onSuccess?.(data),
      onError: (error) => opts?.onError?.(error),
    }),
  );
}

export function useImportCsv(opts?: MutationCallbacks<ImportCsvResult>) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.bills.importCsv.mutationOptions({
      onSuccess: (data) => {
        if ("created" in data) {
          void queryClient.invalidateQueries({ queryKey: trpc.bills.list.queryKey() });
          void queryClient.invalidateQueries({ queryKey: trpc.bills.summary.queryKey() });
          void queryClient.invalidateQueries({ queryKey: trpc.vendors.list.queryKey() });
          toast.success(`${data.created} bill(s) created`);
        }
        opts?.onSuccess?.(data);
      },
      onError: (error) => opts?.onError?.(error),
    }),
  );
}

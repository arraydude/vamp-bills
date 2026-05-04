import { IconArrowLeft } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vamp-bills/backend/trpc/router";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { BillActions } from "@/components/bills/bill-actions.tsx";
import { DatePickerField } from "@/components/bills/date-picker-field.tsx";
import { LineItemsField } from "@/components/bills/line-items-field.tsx";
import { authClient } from "@/lib/auth-client.ts";
import { useTRPC } from "@/lib/trpc.ts";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type HydratedBill = RouterOutputs["bills"]["getById"];

const billFormSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  approverId: z.string().min(1, "Approver is required"),
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  description: z.string().trim().min(1, "Description is required"),
  currency: z.literal("USD"),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid total"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().nullable(),
  lineItems: z
    .array(
      z.object({
        description: z.string().trim().min(1, "Description is required"),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
        position: z.number().int().nonnegative(),
      }),
    )
    .min(1, "At least one line item is required"),
});

export type BillFormValues = z.infer<typeof billFormSchema>;

function mapErrors(errors: ReadonlyArray<unknown>): Array<{ message?: string } | undefined> {
  return errors.map((err) =>
    typeof err === "string" ? { message: err } : ((err as { message?: string }) ?? undefined),
  );
}

function defaultValues(bill: HydratedBill | null, userId: string): BillFormValues {
  if (!bill) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return {
      vendorId: "",
      approverId: userId,
      invoiceNumber: "",
      description: "",
      currency: "USD",
      totalAmount: "0.00",
      invoiceDate: `${y}-${m}-${d}`,
      dueDate: null,
      lineItems: [{ description: "", amount: "", position: 0 }],
    };
  }
  return {
    vendorId: bill.bill.vendorId,
    approverId: bill.bill.approverId,
    invoiceNumber: bill.bill.invoiceNumber,
    description: bill.bill.description,
    currency: "USD",
    totalAmount: bill.bill.totalAmount,
    invoiceDate: bill.bill.invoiceDate,
    dueDate: bill.bill.dueDate,
    lineItems: bill.lineItems.map((li) => ({
      description: li.description,
      amount: li.amount,
      position: li.position,
    })),
  };
}

function computeTotal(lineItems: BillFormValues["lineItems"]): string {
  const totalCents = lineItems.reduce((acc, li) => {
    if (li.amount.trim() === "") return acc;
    const n = Number(li.amount);
    return acc + (Number.isFinite(n) ? Math.round(n * 100) : 0);
  }, 0);
  return (totalCents / 100).toFixed(2);
}

type BillPageProps = {
  bill: HydratedBill | null;
};

export function BillPage({ bill: initialBill }: BillPageProps) {
  const [bill, setBill] = useState(initialBill);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: sessionData } = authClient.useSession();
  const userId = (sessionData?.user?.id as string) ?? "";

  const isNew = bill === null;
  const editable = isNew || bill.bill.status === "draft" || bill.availableEvents.includes("EDIT");

  const { data: vendors = [] } = useQuery(trpc.vendors.list.queryOptions());

  const form = useForm({
    defaultValues: defaultValues(bill, userId),
    validators: { onSubmit: billFormSchema },
    onSubmit: async ({ value }) => {
      const normalized = {
        ...value,
        totalAmount: computeTotal(value.lineItems),
        lineItems: value.lineItems.map((li, i) => ({ ...li, position: i })),
      };

      if (isNew) {
        await createBill.mutateAsync(normalized);
      } else {
        await updateBill.mutateAsync({ id: bill.bill.id, ...normalized });
      }
    },
  });

  useEffect(() => {
    form.setFieldValue("totalAmount", computeTotal(form.state.values.lineItems));
  }, [form, form.state.values.lineItems]);

  const createBill = useMutation(
    trpc.bills.create.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: trpc.bills.list.queryKey() });
        toast.success("Bill created");
        void navigate({ to: "/bills/$billId", params: { billId: data.bill.id } });
      },
    }),
  );

  const updateBill = useMutation(
    trpc.bills.update.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: trpc.bills.list.queryKey() });
        void queryClient.invalidateQueries({
          queryKey: trpc.bills.getById.queryKey({ id: data.bill.id }),
        });
        toast.success("Bill saved");
        setBill(data);
      },
    }),
  );

  const isPending = createBill.isPending || updateBill.isPending;

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/bills"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft className="size-4" />
        Bills
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <FieldGroup>
              <h1 className="text-xl font-semibold tracking-tight">
                {isNew ? "New bill" : `Bill ${bill.bill.invoiceNumber}`}
              </h1>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="vendorId">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Vendor</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val as string)}
                        disabled={!editable}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a vendor…" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={mapErrors(field.state.meta.errors)} />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="invoiceNumber">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Invoice number</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="INV-001"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={!editable}
                      />
                      <FieldError errors={mapErrors(field.state.meta.errors)} />
                    </Field>
                  )}
                </form.Field>
              </div>

              <form.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder="What is this bill for?"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={!editable}
                    />
                    <FieldError errors={mapErrors(field.state.meta.errors)} />
                  </Field>
                )}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="invoiceDate">
                  {(field) => (
                    <DatePickerField
                      id={field.name}
                      label="Invoice date"
                      value={field.state.value}
                      onChange={(date) => field.handleChange(date ?? "")}
                      onBlur={field.handleBlur}
                      disabled={!editable}
                      errors={mapErrors(field.state.meta.errors)}
                    />
                  )}
                </form.Field>

                <form.Field name="dueDate">
                  {(field) => (
                    <DatePickerField
                      id={field.name}
                      label="Due date"
                      placeholder="Optional"
                      value={field.state.value}
                      onChange={(date) => field.handleChange(date)}
                      onBlur={field.handleBlur}
                      disabled={!editable}
                      errors={mapErrors(field.state.meta.errors)}
                    />
                  )}
                </form.Field>
              </div>

              <form.Field name="lineItems" mode="array">
                {(arrayField) => (
                  <LineItemsField
                    items={arrayField.state.value}
                    disabled={!editable}
                    arrayErrors={mapErrors(arrayField.state.meta.errors)}
                    onAdd={() =>
                      arrayField.pushValue({
                        description: "",
                        amount: "",
                        position: arrayField.state.value.length,
                      })
                    }
                    onRemove={(index) => arrayField.removeValue(index)}
                    getDescriptionField={(index) => ({
                      name: `lineItems[${index}].description`,
                      value: arrayField.state.value[index]?.description ?? "",
                      errors: [],
                      handleBlur: () => {},
                      handleChange: (val) => {
                        const items = [...arrayField.state.value];
                        const item = items[index];
                        if (item) {
                          items[index] = { ...item, description: val };
                          arrayField.handleChange(items);
                        }
                      },
                    })}
                    getAmountField={(index) => ({
                      name: `lineItems[${index}].amount`,
                      value: arrayField.state.value[index]?.amount ?? "",
                      errors: [],
                      handleBlur: () => {},
                      handleChange: (val) => {
                        const items = [...arrayField.state.value];
                        const item = items[index];
                        if (item) {
                          items[index] = { ...item, amount: val };
                          arrayField.handleChange(items);
                        }
                      },
                    })}
                  />
                )}
              </form.Field>

              {editable && (
                <>
                  <FieldSeparator />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => navigate({ to: "/bills" })}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Saving..." : isNew ? "Create bill" : "Save changes"}
                    </Button>
                  </div>
                </>
              )}
            </FieldGroup>
          </form>
        </div>

        {bill && (
          <aside className="w-full shrink-0 md:w-72">
            <BillActions bill={bill} onUpdate={setBill} />
          </aside>
        )}
      </div>
    </div>
  );
}

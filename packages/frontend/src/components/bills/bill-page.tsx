import { IconArrowLeft } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { format } from "date-fns";
import { useEffect } from "react";
import { z } from "zod";

import { useCreateBill, useUpdateBill } from "@/api/bills/mutations.ts";
import type { HydratedBill } from "@/api/bills/queries.ts";
import { useUsersList } from "@/api/users/queries.ts";
import { useVendorsList } from "@/api/vendors/queries.ts";
import { BillActions } from "@/components/bills/bill-actions.tsx";
import { BillPageSkeleton } from "@/components/bills/bill-page-skeleton.tsx";
import { DatePickerField } from "@/components/bills/date-picker-field.tsx";
import { LineItemsField } from "@/components/bills/line-items-field.tsx";
import { authClient } from "@/lib/auth-client.ts";

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
    return {
      vendorId: "",
      approverId: userId,
      invoiceNumber: "",
      description: "",
      currency: "USD",
      totalAmount: "0.00",
      invoiceDate: format(new Date(), "yyyy-MM-dd"),
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

export function BillPage({ bill }: BillPageProps) {
  const navigate = useNavigate();
  const { data: sessionData } = authClient.useSession();
  const userId = (sessionData?.user?.id as string) ?? "";

  const isNew = bill === null;
  const editable = isNew || bill.bill.status === "draft" || bill.availableEvents.includes("EDIT");

  const { data: vendors = [], isLoading: vendorsLoading } = useVendorsList();
  const { data: users = [], isLoading: usersLoading } = useUsersList();
  const listsLoading = vendorsLoading || usersLoading;

  const createBill = useCreateBill({
    onSuccess: (data) => void navigate({ to: "/bills/$billId", params: { billId: data.bill.id } }),
  });

  const updateBill = useUpdateBill();

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
    if (userId && !form.state.values.approverId) {
      form.setFieldValue("approverId", userId);
    }
  }, [form, userId]);

  useEffect(() => {
    form.setFieldValue("totalAmount", computeTotal(form.state.values.lineItems));
  }, [form, form.state.values.lineItems]);

  const isPending = createBill.isPending || updateBill.isPending;

  if (listsLoading) return <BillPageSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/bills"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden"
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
                        value={field.state.value || null}
                        onValueChange={(val) => field.handleChange((val as string) ?? "")}
                        items={vendors.map((v) => ({ value: v.id, label: v.name }))}
                        disabled={!editable}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a vendor…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Vendors</SelectLabel>
                            {vendors.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldError errors={mapErrors(field.state.meta.errors)} />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="approverId">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Approver</FieldLabel>
                      <Select
                        value={field.state.value || null}
                        onValueChange={(val) => field.handleChange((val as string) ?? "")}
                        items={users.map((u) => ({ value: u.id, label: u.name }))}
                        disabled={!editable}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an approver…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Users</SelectLabel>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldError errors={mapErrors(field.state.meta.errors)} />
                    </Field>
                  )}
                </form.Field>
              </div>

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
                    renderItemFields={(index) => (
                      <>
                        <form.Field name={`lineItems[${index}].description`}>
                          {(field) => (
                            <Field className="flex-1">
                              {index === 0 && (
                                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                              )}
                              <Input
                                id={field.name}
                                name={field.name}
                                placeholder="Line item description"
                                value={field.state.value as string}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                disabled={!editable}
                              />
                              <FieldError errors={mapErrors(field.state.meta.errors)} />
                            </Field>
                          )}
                        </form.Field>
                        <form.Field name={`lineItems[${index}].amount`}>
                          {(field) => (
                            <Field className="w-28">
                              {index === 0 && <FieldLabel htmlFor={field.name}>Amount</FieldLabel>}
                              <Input
                                id={field.name}
                                name={field.name}
                                placeholder="0.00"
                                className="text-right"
                                value={field.state.value as string}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                disabled={!editable}
                              />
                              <FieldError errors={mapErrors(field.state.meta.errors)} />
                            </Field>
                          )}
                        </form.Field>
                      </>
                    )}
                  />
                )}
              </form.Field>

              {editable && (
                <>
                  <FieldSeparator />
                  <div className="flex justify-end gap-2 print:hidden">
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
          <aside className="w-full shrink-0 print:hidden md:w-72">
            <BillActions bill={bill} />
          </aside>
        )}
      </div>
    </div>
  );
}

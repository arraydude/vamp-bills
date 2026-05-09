import { useForm } from "@tanstack/react-form";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { z } from "zod";

import { useCreateVendor, useUpdateVendor } from "@/api/vendors/mutations.ts";
import type { VendorListItem } from "@/api/vendors/queries.ts";

const vendorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Must be a valid email"),
});

function mapErrors(errors: ReadonlyArray<unknown>): Array<{ message?: string } | undefined> {
  return errors.map((err) =>
    typeof err === "string" ? { message: err } : ((err as { message?: string }) ?? undefined),
  );
}

type VendorFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: VendorListItem | null;
};

export function VendorFormDialog({ open, onOpenChange, vendor }: VendorFormDialogProps) {
  const isNew = vendor === null;

  const createVendor = useCreateVendor({
    onSuccess: () => onOpenChange(false),
  });

  const updateVendor = useUpdateVendor({
    onSuccess: () => onOpenChange(false),
  });

  const form = useForm({
    defaultValues: {
      name: vendor?.name ?? "",
      email: vendor?.email ?? "",
    },
    validators: { onSubmit: vendorFormSchema },
    onSubmit: async ({ value }) => {
      if (isNew) {
        await createVendor.mutateAsync(value);
      } else {
        await updateVendor.mutateAsync({ id: vendor.id, ...value });
      }
    },
  });

  const isPending = createVendor.isPending || updateVendor.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isNew ? "New vendor" : "Edit vendor"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Acme Corp"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                  />
                  <FieldError errors={mapErrors(field.state.meta.errors)} />
                </Field>
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="billing@acme.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                  />
                  <FieldError errors={mapErrors(field.state.meta.errors)} />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isNew ? "Create vendor" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

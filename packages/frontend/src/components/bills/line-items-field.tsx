import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldError, FieldLabel, FieldSeparator } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Item, ItemActions, ItemContent, ItemGroup } from "@workspace/ui/components/item";

export type LineItem = {
  description: string;
  amount: string;
  position: number;
};

type FieldErrors = Array<{ message?: string } | undefined>;

type LineItemField = {
  name: string;
  value: string;
  errors: FieldErrors;
  handleBlur: () => void;
  handleChange: (value: string) => void;
};

type LineItemsFieldProps = {
  items: LineItem[];
  disabled?: boolean;
  arrayErrors?: FieldErrors;
  onAdd: () => void;
  onRemove: (index: number) => void;
  getDescriptionField: (index: number) => LineItemField;
  getAmountField: (index: number) => LineItemField;
};

function toCents(amount: string): number {
  if (amount.trim() === "") return 0;
  const n = Number(amount);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function LineItemsField({
  items,
  disabled,
  arrayErrors,
  onAdd,
  onRemove,
  getDescriptionField,
  getAmountField,
}: LineItemsFieldProps) {
  const totalCents = items.reduce((acc, li) => acc + toCents(li.amount), 0);

  return (
    <div className="flex flex-col gap-4">
      <FieldSeparator>Line items</FieldSeparator>

      <ItemGroup>
        {items.map((item, index) => {
          const desc = getDescriptionField(index);
          const amt = getAmountField(index);

          return (
            <Item key={`li-${item.position}`} variant="outline" size="sm">
              <ItemContent className="flex-row items-center gap-2">
                <Field className="flex-1">
                  {index === 0 && <FieldLabel htmlFor={desc.name}>Description</FieldLabel>}
                  <Input
                    id={desc.name}
                    name={desc.name}
                    placeholder="Line item description"
                    value={desc.value}
                    onBlur={desc.handleBlur}
                    onChange={(e) => desc.handleChange(e.target.value)}
                    disabled={disabled}
                  />
                  <FieldError errors={desc.errors} />
                </Field>

                <Field className="w-28">
                  {index === 0 && <FieldLabel htmlFor={amt.name}>Amount</FieldLabel>}
                  <Input
                    id={amt.name}
                    name={amt.name}
                    placeholder="0.00"
                    className="text-right"
                    value={amt.value}
                    onBlur={amt.handleBlur}
                    onChange={(e) => amt.handleChange(e.target.value)}
                    disabled={disabled}
                  />
                  <FieldError errors={amt.errors} />
                </Field>
              </ItemContent>

              <ItemActions>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  disabled={disabled || items.length <= 1}
                  onClick={() => onRemove(index)}
                >
                  <IconTrash className="size-4" />
                </Button>
              </ItemActions>
            </Item>
          );
        })}
      </ItemGroup>

      <FieldError errors={arrayErrors} />

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" type="button" disabled={disabled} onClick={onAdd}>
          <IconPlus className="size-4" />
          Add line item
        </Button>

        <div className="text-sm font-medium tabular-nums">
          Total: ${(totalCents / 100).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

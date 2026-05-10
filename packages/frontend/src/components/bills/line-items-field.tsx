import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import { FieldError, FieldSeparator } from "@workspace/ui/components/field";
import { Item, ItemContent, ItemGroup } from "@workspace/ui/components/item";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

export type LineItem = {
  description: string;
  amount: string;
  position: number;
};

type FieldErrors = Array<{ message?: string } | undefined>;

type LineItemsFieldProps = {
  items: LineItem[];
  totalAmount: string;
  disabled?: boolean;
  arrayErrors?: FieldErrors;
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItemFields: (index: number) => ReactNode;
};

let nextKeyId = 0;
function generateKey(): number {
  return ++nextKeyId;
}

export function LineItemsField({
  items,
  totalAmount,
  disabled,
  arrayErrors,
  onAdd,
  onRemove,
  renderItemFields,
}: LineItemsFieldProps) {
  const [keys, setKeys] = useState(() => items.map(() => generateKey()));

  const handleAdd = useCallback(() => {
    setKeys((prev) => [...prev, generateKey()]);
    onAdd();
  }, [onAdd]);

  const handleRemove = useCallback(
    (index: number) => {
      setKeys((prev) => prev.filter((_, i) => i !== index));
      onRemove(index);
    },
    [onRemove],
  );

  return (
    <div className="flex flex-col gap-4">
      <FieldSeparator>Line items</FieldSeparator>

      <ItemGroup>
        {items.map((_item, index) => (
          <Item key={keys[index]} variant="outline" size="sm" role="listitem">
            <ItemContent className="flex-col gap-0">
              <div className="flex items-end gap-2">
                {renderItemFields(index)}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  aria-label="Remove line item"
                  className="mb-0.5 shrink-0"
                  disabled={disabled || items.length <= 1}
                  onClick={() => handleRemove(index)}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>

      <FieldError errors={arrayErrors} />

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={disabled}
          onClick={handleAdd}
          className="print:hidden"
        >
          <IconPlus className="size-4" />
          Add line item
        </Button>

        <div className="text-sm font-medium tabular-nums">
          Total: ${Number(totalAmount).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

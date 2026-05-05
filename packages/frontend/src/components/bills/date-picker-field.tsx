import { IconCalendar } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { format, parse } from "date-fns";
import { useState } from "react";

type DatePickerFieldProps = {
  value: string | null;
  onChange: (date: string | null) => void;
  onBlur?: () => void;
  label: string;
  id: string;
  placeholder?: string;
  errors?: Array<{ message?: string } | undefined>;
  disabled?: boolean;
};

export function DatePickerField({
  value,
  onChange,
  onBlur,
  label,
  id,
  placeholder = "Pick a date",
  errors,
  disabled,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const parsed = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) onBlur?.();
        }}
      >
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="outline"
              disabled={disabled}
              className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}
            />
          }
        >
          <IconCalendar className="size-4" />
          {parsed ? format(parsed, "MMM d, yyyy") : placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parsed}
            onSelect={(date) => {
              onChange(date ? format(date, "yyyy-MM-dd") : null);
              setOpen(false);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      <FieldError errors={errors} />
    </Field>
  );
}

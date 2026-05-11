import { z } from "zod";

export const requiredText = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { message: `${label} is required` });

export const decimalAmount = z.string().regex(/^\d+(\.\d{1,2})?$/, {
  message: "must be a non-negative decimal with up to 2 fractional digits",
});

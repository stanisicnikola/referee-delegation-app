import { z } from "zod";

export const digitsOnly = (value = "") => value.replace(/\D/g, "");

export const phoneSchema = z
  .string()
  .trim()
  .refine((value) => !value || /^\+?[\d\s\-().]*$/.test(value), {
    message:
      "This field can only contain digits and an optional + at the beginning.",
  })
  .transform((value) => {
    if (!value) return undefined;

    const hasPlus = value.startsWith("+");
    const digits = digitsOnly(value);
    return hasPlus ? `+${digits}` : digits;
  })
  .refine((value) => value === undefined || /^\+?\d{8,15}$/.test(value), {
    message: "Phone number must be between 8 and 15 digits.",
  })
  .optional();

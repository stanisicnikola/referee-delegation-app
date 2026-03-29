import { z } from "zod";

const capacitySchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return "";
    return String(value);
  },
  z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), {
      message: "Capacity must contain only digits.",
    })
    .transform((value) => (value === "" ? null : Number(value)))
    .refine((value) => value === null || value >= 0, {
      message: "Capacity must be a positive number.",
    }),
);

export const venueSchema = z.object({
  name: z
    .string()
    .min(2, "Venue name must be at least 2 characters")
    .max(200, "Venue name must be less than 200 characters"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  capacity: capacitySchema,
});

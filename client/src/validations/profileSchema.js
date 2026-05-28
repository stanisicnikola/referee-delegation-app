import { z } from "zod";
import { phoneSchema } from "./sharedSchemas";

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be at most 50 characters."),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be at most 50 characters."),
  phone: phoneSchema,
});

import { z } from "zod";
import { phoneSchema } from "./sharedSchemas";
import { REFEREE_CATEGORY_VALUES } from "../constants/refereeCategories";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*\s).{8,}$/;

export const baseRefereeSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be at most 50 characters."),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be at most 50 characters."),
  email: z.string().email("Invalid email address."),
  phone: phoneSchema,
  role: z.literal("referee"),
  status: z.enum(["active", "inactive", "suspended"]),
  licenseCategory: z.enum(REFEREE_CATEGORY_VALUES, {
    required_error: "License category is required.",
  }),
  country: z
    .string({ required_error: "Country is required." })
    .trim()
    .min(1, "Country is required.")
    .max(100, "Country cannot exceed 100 characters."),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
});

export const refereeSchema = baseRefereeSchema.refine(
  (data) => {
    if (data.password || data.confirmPassword) {
      if (!data.password || data.password.length < 8) return false;
      if (!passwordRegex.test(data.password)) return false;
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  },
);

export const createRefereeSchema = baseRefereeSchema
  .extend({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(
        passwordRegex,
        "Password must include an uppercase letter, a number and a special character.",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    sendWelcomeEmail: z.boolean().optional(),
    requirePasswordChange: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

import { z } from "zod";

const digitsOnly = (s = "") => s.replace(/\D/g, "");
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*\s).{8,}$/;

const phoneSchema = z
  .string()
  .trim()
  .refine((s) => !s || /^[+\d\s\-().]*$/.test(s), {
    message: "Phone may contain only digits, and an optional leading +.",
  })
  .transform((s) => {
    if (!s) return undefined;
    const hasPlus = /^\+/.test(s.trim());
    const digits = digitsOnly(s);
    if (!digits) return undefined;
    return hasPlus ? `+${digits}` : digits;
  })
  .refine((v) => v === undefined || /^\+?\d{8,15}$/.test(v), {
    message:
      "Phone number must contain between 8 and 15 digits (optional leading +).",
  })
  .optional();

const experienceYearsSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return "";
    return String(value);
  },
  z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), {
      message: "Experience years must contain only digits.",
    })
    .transform((value) => (value === "" ? undefined : Number(value)))
    .refine((value) => value === undefined || (value >= 0 && value <= 40), {
      message: "Experience years must be between 0 and 40.",
    }),
);

const baseUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be at most 50 characters."),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be at most 50 characters."),
  email: z.email("Invalid email address."),
  phone: phoneSchema,
  role: z.enum(["referee", "delegate", "admin"], "Invalid role."),
  status: z.enum(["active", "inactive", "suspended"], "Invalid status."),
  licenseNumber: z.string().optional(),
  licenseCategory: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["international", "A", "B", "C", "regional"]).optional(),
  ),
  city: z.string().optional(),
  experienceYears: experienceYearsSchema.optional(),
});

const refereeFieldsSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required."),
  licenseCategory: z.enum(["international", "A", "B", "C", "regional"], {
    required_error: "License category is required.",
  }),
  city: z.string().min(1, "City is required."),
  experienceYears: experienceYearsSchema.refine(
    (value) => value !== undefined,
    {
      message: "Experience years is required.",
    },
  ),
});

const passwordCreateSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .regex(
        passwordRegex,
        "Password must include an uppercase letter, a lowercase letter, a number, and a special character.",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((vals, ctx) => {
    if (vals.password !== vals.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

const createOnlyOptionsSchema = z.object({
  sendWelcomeEmail: z.boolean().optional(),
  requirePasswordChange: z.boolean().optional(),
});

export const createUserSchema = baseUserSchema
  .merge(passwordCreateSchema)
  .merge(createOnlyOptionsSchema)
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
    if (data.role === "referee") {
      const result = refereeFieldsSchema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => ctx.addIssue(issue));
      }
    }
  });

export const updateUserSchema = baseUserSchema.superRefine((data, ctx) => {
  if (data.role === "referee") {
    const result = refereeFieldsSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => ctx.addIssue(issue));
    }
  }
});

const { z } = require("zod");
const { REFEREE_CATEGORY_VALUES } = require("../constants/refereeCategories");

const country = z
  .string({ required_error: "Country is required." })
  .trim()
  .min(1, "Country is required.")
  .max(100, "Country cannot exceed 100 characters.");

const create = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Invalid email format."),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, "Password must be at least 8 characters."),
  firstName: z
    .string({ required_error: "First name is required." })
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be at most 50 characters."),
  lastName: z
    .string({ required_error: "Last name is required." })
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be at most 50 characters."),
  phone: z.string().optional().nullable(),
  role: z.enum(["admin", "delegate", "referee"]),
  status: z.enum(["active", "inactive", "suspended"]),
  licenseCategory: z.enum(REFEREE_CATEGORY_VALUES).optional(),
  dateOfBirth: z.string().optional().nullable(),
  country: country.optional(),
  address: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  confirmPassword: z.string().optional(),
  sendWelcomeEmail: z.boolean().optional(),
  requirePasswordChange: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "referee" && !data.country) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Country is required.",
      path: ["country"],
    });
  }
});

const update = z.object({
  email: z.string().email("Invalid email format.").optional(),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["admin", "delegate", "referee"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  licenseCategory: z.enum(REFEREE_CATEGORY_VALUES).optional(),
  dateOfBirth: z.string().optional().nullable(),
  country: country.optional(),
  address: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.role === "referee" && !data.country) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Country is required.",
      path: ["country"],
    });
  }
});

const query = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  role: z.enum(["admin", "delegate", "referee"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  search: z.string().optional(),
});

const params = z.object({
  id: z.string().uuid("Invalid ID format."),
});

const resetPassword = z.object({
  newPassword: z
    .string({ required_error: "New password is required." })
    .min(8, "Password must be at least 8 characters."),
});

module.exports = {
  create,
  update,
  query,
  params,
  resetPassword,
};

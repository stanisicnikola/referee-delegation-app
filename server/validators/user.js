const { z } = require("zod");
const { REFEREE_CATEGORY_VALUES } = require("../constants/refereeCategories");

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
  licenseNumber: z.string().optional(),
  licenseCategory: z.enum(REFEREE_CATEGORY_VALUES).optional(),
  dateOfBirth: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  experienceYears: z.union([z.number(), z.string()]).optional(),
  bankAccount: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  confirmPassword: z.string().optional(),
  sendWelcomeEmail: z.boolean().optional(),
  requirePasswordChange: z.boolean().optional(),
});

const update = z.object({
  email: z.string().email("Invalid email format.").optional(),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["admin", "delegate", "referee"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  licenseNumber: z.string().optional(),
  licenseCategory: z.enum(REFEREE_CATEGORY_VALUES).optional(),
  dateOfBirth: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  experienceYears: z.union([z.number(), z.string()]).optional(),
  bankAccount: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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

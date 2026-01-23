const { z } = require("zod");

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
});

const update = z.object({
  email: z.string().email("Invalid email format.").optional(),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["admin", "delegate", "referee"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
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

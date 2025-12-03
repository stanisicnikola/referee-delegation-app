const { z } = require("zod");

const login = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Invalid email format."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

const register = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Invalid email format."),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  firstName: z
    .string({ required_error: "First name is required." })
    .min(2, "First name must be at least 2 characters.")
    .max(100, "First name can be at most 100 characters."),
  lastName: z
    .string({ required_error: "Last name is required." })
    .min(2, "Last name must be at least 2 characters.")
    .max(100, "Last name can be at most 100 characters."),
  phone: z
    .string()
    .regex(/^[\d\s\+\-\(\)]+$/, "Invalid phone number format.")
    .optional()
    .nullable(),
  role: z.enum(["admin", "delegate"]).optional(),
});

const registerReferee = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Invalid email format."),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, "Password must be at least 8 characters."),
  firstName: z
    .string({ required_error: "First name is required." })
    .min(2)
    .max(100),
  lastName: z
    .string({ required_error: "Last name is required." })
    .min(2)
    .max(100),
  phone: z.string().optional().nullable(),
  licenseNumber: z.string({ required_error: "License number is required." }),
  licenseCategory: z.enum(["A", "B", "C", "D"]).optional(),
  dateOfBirth: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).optional(),
  bankAccount: z.string().optional().nullable(),
});

const changePassword = z.object({
  currentPassword: z
    .string({ required_error: "Current password is required." })
    .min(1, "Current password is required."),
  newPassword: z
    .string({ required_error: "New password is required." })
    .min(8, "New password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

module.exports = {
  login,
  register,
  registerReferee,
  changePassword,
};

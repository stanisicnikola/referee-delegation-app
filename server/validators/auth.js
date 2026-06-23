const { z } = require("zod");
const { REFEREE_CATEGORY_VALUES } = require("../constants/refereeCategories");

const digitsOnly = (value = "") => value.replace(/\D/g, "");

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
  licenseCategory: z.enum(REFEREE_CATEGORY_VALUES).optional(),
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

const forgotPassword = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Invalid email format."),
});

const resetPassword = z.object({
  token: z
    .string({ required_error: "Reset token is required." })
    .min(32, "Invalid reset token."),
  newPassword: z
    .string({ required_error: "New password is required." })
    .min(8, "New password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

const verifyPassword = z.object({
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

const nullablePhone = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return "";
    const trimmed = String(value).trim();
    return trimmed;
  },
  z
    .string()
    .trim()
    .refine((value) => !value || /^\+?[\d\s\-().]*$/.test(value), {
      message:
        "This field can only contain digits and an optional + at the beginning.",
    })
    .transform((value) => {
      if (!value) return null;

      const hasPlus = value.startsWith("+");
      const digits = digitsOnly(value);
      return hasPlus ? `+${digits}` : digits;
    })
    .refine((value) => value === null || /^\+?\d{8,15}$/.test(value), {
      message: "Phone number must be between 8 and 15 digits.",
    }),
);

const updateMe = z.object({
  firstName: z
    .string({ required_error: "First name is required." })
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(100, "First name can be at most 100 characters."),
  lastName: z
    .string({ required_error: "Last name is required." })
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(100, "Last name can be at most 100 characters."),
  phone: nullablePhone,
});

module.exports = {
  login,
  register,
  registerReferee,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyPassword,
  updateMe,
};

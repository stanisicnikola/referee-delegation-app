// import { z } from "zod";

// // Base user schema
// const baseUserSchema = z.object({
//   firstName: z
//     .string()
//     .min(1, "First name is required")
//     .min(2, "First name must be at least 2 characters")
//     .max(50, "First name can be at most 50 characters"),
//   lastName: z
//     .string()
//     .min(1, "Last name is required")
//     .min(2, "Last name must be at least 2 characters")
//     .max(50, "Last name can be at most 50 characters"),
//   email: z.email({ message: "Enter a valid email address" }),
//   phone: z
//     .string()
//     .regex(/^\d*$/, "Phone number must contain only digits")
//     .optional(),
//   role: z.enum(["referee", "delegate", "admin"], {
//     errorMap: () => ({ message: "Select a valid role" }),
//   }),
// });

// // Password fields for create
// const passwordFields = z
//   .object({
//     password: z
//       .string()
//       .min(1, "Password is required")
//       .min(8, "Password must be at least 8 characters")
//       .regex(
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
//         "Password must contain an uppercase letter, a lowercase letter, and a number"
//       ),
//     confirmPassword: z.string().min(1, "Confirm password is required"),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// // Options for create
// const createOptions = z.object({
//   sendWelcomeEmail: z.boolean(),
//   requirePasswordChange: z.boolean(),
// });

// // Schema for creating a new user
// export const userCreateSchema = z
//   .object({})
//   .merge(baseUserSchema)
//   .merge(passwordFields)
//   .merge(createOptions)
//   .merge(
//     z.object({
//       // Conditional referee fields
//       licenseNumber: z.string().optional(),
//       licenseCategory: z.string().optional(),
//       city: z.string().optional(),
//       experienceYears: z.number().optional(),
//     })
//   )
//   .superRefine((data, ctx) => {
//     // If role is referee, require referee fields
//     if (data.role === "referee") {
//       if (!data.licenseNumber) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "License number is required for referees",
//           path: ["licenseNumber"],
//         });
//       }
//       if (!data.licenseCategory) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "License category is required for referees",
//           path: ["licenseCategory"],
//         });
//       }
//       if (!data.city) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "City is required for referees",
//           path: ["city"],
//         });
//       }

//       // Validate license number format if provided
//       if (
//         data.licenseNumber &&
//         !/^SUD-[0-9]{4}-[0-9]{3}$/.test(data.licenseNumber)
//       ) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "License number must be in format SUD-XXXX-XXX",
//           path: ["licenseNumber"],
//         });
//       }

//       // Validate license category
//       if (
//         data.licenseCategory &&
//         !["international", "A", "B", "C", "regional"].includes(
//           data.licenseCategory
//         )
//       ) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Select a valid license category",
//           path: ["licenseCategory"],
//         });
//       }
//     }
//   });

// // Schema for updating an existing user
// export const userUpdateSchema = z
//   .object({})
//   .merge(baseUserSchema)
//   .merge(
//     z.object({
//       // Optional password change
//       password: z
//         .string()
//         .optional()
//         .refine(
//           (val) => !val || val.length >= 8,
//           "Password must be at least 8 characters"
//         )
//         .refine(
//           (val) => !val || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
//           "Password must contain an uppercase letter, a lowercase letter, and a number"
//         ),
//       confirmPassword: z.string().optional(),

//       // Optional referee fields
//       licenseNumber: z.string().optional(),
//       licenseCategory: z.string().optional(),
//       city: z.string().optional(),
//       experienceYears: z.number().optional(),
//     })
//   )
//   .superRefine((data, ctx) => {
//     // If password is provided, confirmPassword must match
//     if (data.password) {
//       if (!data.confirmPassword) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Confirm password is required when changing password",
//           path: ["confirmPassword"],
//         });
//       } else if (data.password !== data.confirmPassword) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Passwords do not match",
//           path: ["confirmPassword"],
//         });
//       }
//     }

//     // If role is referee, require referee fields
//     if (data.role === "referee") {
//       if (!data.licenseNumber) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "License number is required for referees",
//           path: ["licenseNumber"],
//         });
//       }
//       if (!data.licenseCategory) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "License category is required for referees",
//           path: ["licenseCategory"],
//         });
//       }
//       if (!data.city) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "City is required for referees",
//           path: ["city"],
//         });
//       }

//       // Validate license number format if provided
//       if (
//         data.licenseNumber &&
//         !/^SUD-[0-9]{4}-[0-9]{3}$/.test(data.licenseNumber)
//       ) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "License number must be in format SUD-XXXX-XXX",
//           path: ["licenseNumber"],
//         });
//       }

//       // Validate license category
//       if (
//         data.licenseCategory &&
//         !["international", "A", "B", "C", "regional"].includes(
//           data.licenseCategory
//         )
//       ) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Select a valid license category",
//           path: ["licenseCategory"],
//         });
//       }
//     }
//   });

// OVO JE DRUGO

// import { z } from "zod";

// // Bazna šema za SVE korisnike
// const baseUserSchema = z.object({
//   role: z.enum(["admin", "delegate", "referee"]),
//   firstName: z.string().min(2, "First name is required"),
//   lastName: z.string().min(2, "Last name is required"),
//   email: z.string().email("Invalid email"),
//   phone: z.string().optional(),
//   password: z.string().min(8, "Minimum 8 characters").optional(),
//   confirmPassword: z.string().optional(),
//   sendWelcomeEmail: z.boolean().optional(),
//   requirePasswordChange: z.boolean().optional(),
// });

// // Referee-specifična polja
// const refereeFieldsSchema = z.object({
//   licenseNumber: z.string().min(1, "License number is required"),
//   licenseCategory: z.enum(["international", "A", "B", "C", "regional"], {
//     required_error: "Category is required",
//   }),
//   city: z.string().min(1, "City is required"),
//   experienceYears: z.number().min(0).optional(),
// });

// // Dinamička funkcija koja generiše šemu
// export const getUserSchema = (role, isEdit = false) => {
//   let schema = baseUserSchema;

//   // Dodaj referee polja ako je referee
//   if (role === "referee") {
//     schema = baseUserSchema.merge(refereeFieldsSchema);
//   }

//   // Za edit mode, password je opcioni
//   if (isEdit) {
//     schema = schema.extend({
//       password: z.string().min(8).optional().or(z.literal("")),
//       confirmPassword: z.string().optional().or(z.literal("")),
//     });
//   } else {
//     // Za create mode, password je obavezan
//     schema = schema.extend({
//       password: z.string().min(8, "Password is required"),
//       confirmPassword: z.string().min(8, "Confirm password is required"),
//     });
//   }

//   // Validacija da se passwordi poklapaju
//   return schema.refine(
//     (data) => {
//       if (data.password || data.confirmPassword) {
//         return data.password === data.confirmPassword;
//       }
//       return true;
//     },
//     {
//       message: "Passwords don't match",
//       path: ["confirmPassword"],
//     }
//   );
// };

// OVO JE MOJE
import { z } from "zod";
const digitsOnly = (s = "") => s.replace(/\D/g, "");

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be at most 50 characters."),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be at most 50 characters."),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, "Password must be at least 8 characters."),
  email: z.email("Invalid email address."),
  phone: z
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
    .optional(),
  role: z.enum(["referee", "delegate", "admin"], "Invalid role."),
  status: z.enum(["active", "inactive", "suspended"], "Invalid status."),
  licenseNumber: z.string().optional(),
  licenseCategory: z.string().optional(),
  city: z.string().optional(),
  experienceYears: z.number().optional(),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be at most 50 characters."),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be at most 50 characters."),

  email: z.email("Invalid email address."),
  phone: z
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
    .optional(),
  role: z.enum(["referee", "delegate", "admin"], "Invalid role."),
  status: z.enum(["active", "inactive", "suspended"], "Invalid status."),
  licenseNumber: z.string().optional(),
  licenseCategory: z.string().optional(),
  city: z.string().optional(),
  experienceYears: z.number().optional(),
});

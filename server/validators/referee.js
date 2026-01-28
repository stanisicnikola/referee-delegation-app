const { z } = require("zod");

const create = z.object({
  userId: z.string().uuid("Invalid ID format."),
  licenseNumber: z.string({ required_error: "License number is required." }),
  licenseCategory: z.enum(["international", "A", "B", "C", "regional"]),
  dateOfBirth: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).optional(),
  bankAccount: z.string().optional().nullable(),
});

const update = z.object({
  licenseNumber: z.string().optional(),
  licenseCategory: z.enum(["international", "A", "B", "C", "regional"]),
  dateOfBirth: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).optional(),
  bankAccount: z.string().optional().nullable(),
});

const query = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  licenseCategory: z
    .enum(["international", "A", "B", "C", "regional"])
    .optional(),
  city: z.string().optional(),
  search: z.string().optional(),
});

const params = z.object({
  id: z.string().uuid("Invalid ID format."),
});

const availableQuery = z.object({
  date: z.string({ required_error: "Date is required." }),
});

module.exports = {
  create,
  update,
  query,
  params,
  availableQuery,
};

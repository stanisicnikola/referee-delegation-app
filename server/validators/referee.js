const { z } = require("zod");
const { REFEREE_CATEGORY_VALUES } = require("../constants/refereeCategories");

const country = z
  .string({ required_error: "Country is required." })
  .trim()
  .min(1, "Country is required.")
  .max(100, "Country cannot exceed 100 characters.");

const create = z.object({
  userId: z.string().uuid("Invalid ID format."),
  licenseCategory: z.enum(REFEREE_CATEGORY_VALUES),
  dateOfBirth: z.string().optional().nullable(),
  country,
  address: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
});

const update = z.object({
  licenseCategory: z.enum(REFEREE_CATEGORY_VALUES).optional(),
  dateOfBirth: z.string().optional().nullable(),
  country: country.optional(),
  address: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
});

const query = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  licenseCategory: z.enum(REFEREE_CATEGORY_VALUES).optional(),
  country: z.string().optional(),
  search: z.string().optional(),
});

const params = z.object({
  id: z.string().uuid("Invalid ID format."),
});

const availableQuery = z.object({
  date: z.string({ required_error: "Date is required." }),
});

const dashboardQuery = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Invalid month format. Use YYYY-MM.")
    .optional(),
});

const historyQuery = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  search: z.string().optional(),
  competitionId: z.string().uuid("Invalid ID format.").optional(),
  role: z.enum(["first_referee", "second_referee", "third_referee"]).optional(),
});

module.exports = {
  create,
  update,
  query,
  params,
  availableQuery,
  dashboardQuery,
  historyQuery,
};

const { z } = require("zod");

const country = z
  .string({ required_error: "Country is required." })
  .trim()
  .min(1, "Country is required.")
  .max(100, "Country cannot exceed 100 characters.");

const create = z.object({
  name: z.string({ required_error: "Team name is required." }).min(2).max(100),
  shortName: z.string().max(10).optional().nullable(),
  city: z.string({ required_error: "City is required." }),
  country,
  primaryVenueId: z
    .string()
    .uuid("Invalid venue ID format.")
    .optional()
    .nullable(),
  logoUrl: z.string().url().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
});

const update = z.object({
  name: z.string().min(2).max(100).optional(),
  shortName: z.string().max(10).optional().nullable(),
  city: z.string().optional(),
  country: country.optional(),
  primaryVenueId: z
    .string()
    .uuid("Invalid venue ID format.")
    .optional()
    .nullable(),
  logoUrl: z.string().url().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
});

const query = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  search: z.string().optional(),
});

const params = z.object({
  id: z.string().uuid("Invalid ID format."),
});

module.exports = {
  create,
  update,
  query,
  params,
};

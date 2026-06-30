const { z } = require("zod");

const country = z
  .string({ required_error: "Country is required." })
  .trim()
  .min(1, "Country is required.")
  .max(100, "Country cannot exceed 100 characters.");

const create = z.object({
  name: z.string({ required_error: "Venue name is required." }).min(2).max(200),
  city: z.string({ required_error: "City is required." }),
  country,
  address: z.string({ required_error: "Address is required." }),
  capacity: z.number().int().min(0).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

const update = z.object({
  name: z.string().min(2).max(200).optional(),
  city: z.string().optional(),
  country: country.optional(),
  address: z.string().optional(),
  capacity: z.number().int().min(0).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
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

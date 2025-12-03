const { z } = require("zod");

const create = z.object({
  name: z.string({ required_error: "Venue name is required." }).min(2).max(200),
  city: z.string({ required_error: "City is required." }),
  address: z.string({ required_error: "Address is required." }),
  capacity: z.number().int().min(0).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

const update = z.object({
  name: z.string().min(2).max(200).optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  capacity: z.number().int().min(0).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

const query = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  city: z.string().optional(),
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

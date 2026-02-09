const { z } = require("zod");

const create = z.object({
  name: z
    .string({ required_error: "Competition name is required." })
    .min(2)
    .max(200),
  season: z.string({ required_error: "Season is required." }),
  category: z.enum(["seniors", "juniors", "youth"]).optional(),
  gender: z.enum(["male", "female"]).optional(),
  status: z.enum(["upcoming", "active", "completed", "suspended"]).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const update = z.object({
  name: z.string().min(2).max(200).optional(),
  season: z.string().optional(),
  category: z.enum(["seniors", "juniors", "youth"]).optional(),
  gender: z.enum(["male", "female"]).optional(),
  status: z.enum(["upcoming", "active", "completed", "suspended"]).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const query = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  season: z.string().optional(),
  category: z.enum(["seniors", "juniors", "youth"]).optional(),
  gender: z.enum(["male", "female"]).optional(),
  status: z.enum(["upcoming", "active", "completed", "suspended"]).optional(),
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

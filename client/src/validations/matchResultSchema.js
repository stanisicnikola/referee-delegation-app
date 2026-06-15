import { z } from "zod";

const scoreSchema = z
  .string()
  .trim()
  .min(1, "Score is required.")
  .regex(/^\d+$/, "Score must be a whole number.")
  .transform((value) => Number(value));

export const matchResultSchema = z.object({
  homeScore: scoreSchema,
  awayScore: scoreSchema,
  reportNotes: z
    .string()
    .max(2000, "Match report can be up to 2000 characters.")
    .optional(),
});

export const matchResultDefaultValues = {
  homeScore: "",
  awayScore: "",
  reportNotes: "",
};

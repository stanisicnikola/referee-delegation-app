import { z } from "zod";

const seasonRegex = /^\d{4}\/\d{4}$/;

export const competitionSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(100, "Name must be less than 100 characters"),
    season: z
      .string()
      .regex(
        seasonRegex,
        "Season must be in format YYYY/YYYY (e.g., 2026/2027)",
      ),
    category: z.enum(["seniors", "juniors", "youth"], {
      required_error: "Please select a competition category",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

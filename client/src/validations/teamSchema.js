import { z } from "zod";

export const teamSchema = z.object({
  name: z
    .string({ required_error: "Team name is required." })
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),
  shortName: z
    .string()
    .min(2, "Short name must be at least 2 characters.")
    .max(6, "Short name cannot exceed 6 characters."),
  city: z
    .string({ required_error: "City is required." })
    .min(1, "City is required."),
  country: z
    .string({ required_error: "Country is required." })
    .trim()
    .min(1, "Country is required.")
    .max(100, "Country cannot exceed 100 characters."),
  primaryVenueId: z.uuid("Home venue is required."),
});

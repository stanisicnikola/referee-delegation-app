import { z } from "zod";

export const matchSchema = z
  .object({
    id: z.uuid().optional(),
    competitionId: z.uuid("Competition is required"),
    homeTeamId: z.uuid("Home team is required"),
    awayTeamId: z.uuid("Away team is required"),
    venueId: z.uuid("Venue is required"),
    round: z.string().regex(/^\d+$/, "Round must be a number"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    notes: z.string().optional(),
    delegateId: z.uuid("Delegate is required"),
  })
  .superRefine((data, ctx) => {
    // Only check for past date if we are CREATING a new match (no ID)
    if (!data.id) {
      const scheduledDate = new Date(`${data.date}T${data.time}`);
      const now = new Date();

      if (scheduledDate < now) {
        ctx.issues.push({
          code: "custom",
          message: "Match date and time cannot be in the past",
          path: ["date"],
        });
      }
    }
  });

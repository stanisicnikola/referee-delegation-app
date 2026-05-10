import { z } from "zod";

export const createMatchSchema = ({ requireDelegate = false } = {}) =>
  z
    .object({
      id: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.uuid().optional(),
      ),
      competitionId: z.uuid("Competition is required"),
      homeTeamId: z.uuid("Home team is required"),
      awayTeamId: z.uuid("Away team is required"),
      venueId: z.uuid("Venue is required"),
      round: z.string().regex(/^\d+$/, "Round must be a number"),
      date: z.string().min(1, "Date is required"),
      time: z.string().min(1, "Time is required"),
      notes: z.string().optional(),
      delegateId: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.uuid("Delegate is required").optional(),
      ),
    })
    .superRefine((data, ctx) => {
      if (requireDelegate && !data.delegateId) {
        ctx.addIssue({
          code: "custom",
          message: "Delegate is required",
          path: ["delegateId"],
        });
      }

      // Only check for past date if we are CREATING a new match (no ID)
      if (!data.id) {
        const scheduledDate = new Date(`${data.date}T${data.time}`);
        const now = new Date();

        if (scheduledDate < now) {
          ctx.addIssue({
            code: "custom",
            message: "Match date and time cannot be in the past",
            path: ["date"],
          });
        }
      }
    });

export const matchSchema = createMatchSchema();

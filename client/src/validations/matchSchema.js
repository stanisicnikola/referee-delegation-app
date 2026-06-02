import { z } from "zod";

const formatCompetitionRange = (competition) => {
  if (!competition?.startDate || !competition?.endDate) {
    return "the competition dates";
  }
  return `${competition.startDate} - ${competition.endDate}`;
};

export const createMatchSchema = ({
  requireDelegate = false,
  competitions = [],
} = {}) =>
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

      const competition = competitions.find(
        (item) => item.id === data.competitionId,
      );

      if (competition?.startDate && data.date < competition.startDate) {
        ctx.addIssue({
          code: "custom",
          message: `Match date must be within ${competition.name} (${formatCompetitionRange(competition)})`,
          path: ["date"],
        });
      }

      if (competition?.endDate && data.date > competition.endDate) {
        ctx.addIssue({
          code: "custom",
          message: `Match date must be within ${competition.name} (${formatCompetitionRange(competition)})`,
          path: ["date"],
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

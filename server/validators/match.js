const { z } = require("zod");

const create = z.object({
  competitionId: z
    .string({ required_error: "Competition ID is required." })
    .uuid(),
  homeTeamId: z.string({ required_error: "Home team ID is required." }).uuid(),
  awayTeamId: z.string({ required_error: "Away team ID is required." }).uuid(),
  venueId: z.string().uuid().optional().nullable(),
  scheduledAt: z.string({
    required_error: "Match date and time are required.",
  }),
  round: z.string().optional().nullable(),
  matchNumber: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const update = z.object({
  competitionId: z.string().uuid().optional(),
  homeTeamId: z.string().uuid().optional(),
  awayTeamId: z.string().uuid().optional(),
  venueId: z.string().uuid().optional().nullable(),
  scheduledAt: z.string().optional(),
  round: z.string().optional().nullable(),
  matchNumber: z.number().int().optional().nullable(),
  status: z
    .enum(["scheduled", "in_progress", "completed", "postponed", "cancelled"])
    .optional(),
  notes: z.string().optional().nullable(),
});

const updateResult = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

const query = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  competitionId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  venueId: z.string().uuid().optional(),
  status: z
    .enum(["scheduled", "in_progress", "completed", "postponed", "cancelled"])
    .optional(),
  delegationStatus: z
    .enum(["pending", "partial", "complete", "confirmed"])
    .optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  round: z.string().optional(),
});

const params = z.object({
  id: z.string().uuid("Invalid ID format."),
});

module.exports = {
  create,
  update,
  updateResult,
  query,
  params,
};

const { z } = require("zod");

const delegate = z.object({
  refereeAssignments: z
    .array(
      z.object({
        refereeId: z
          .string({ required_error: "Referee ID is required." })
          .uuid(),
        role: z.enum(["first_referee", "second_referee", "third_referee"]),
      })
    )
    .min(1, "At least one referee must be delegated."),
});

const updateRole = z.object({
  role: z.enum(["first_referee", "second_referee", "third_referee"]),
});

const reject = z.object({
  reason: z.string().optional(),
});

const matchParams = z.object({
  matchId: z.string().uuid("Invalid match ID format."),
});

const matchRefereeParams = z.object({
  matchId: z.string().uuid("Invalid match ID format."),
  refereeId: z.string().uuid("Invalid referee ID format."),
});

module.exports = {
  delegate,
  updateRole,
  reject,
  matchParams,
  matchRefereeParams,
};

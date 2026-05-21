const { z } = require("zod");

const setAvailability = z.object({
  date: z.string({ required_error: "Date is required." }),
  isAvailable: z.boolean({
    required_error: "Availability status is required.",
  }),
  reason: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  approvalStatus: z
    .enum(["pending", "approved", "rejected"])
    .optional()
    .nullable(),
});

const setAvailabilityRange = z.object({
  dateFrom: z.string({ required_error: "Start date is required." }),
  dateTo: z.string({ required_error: "End date is required." }),
  isAvailable: z.boolean({
    required_error: "Availability status is required.",
  }),
  reason: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  approvalStatus: z
    .enum(["pending", "approved", "rejected"])
    .optional()
    .nullable(),
});

const calendarQuery = z.object({
  year: z.string().transform(Number),
  month: z.string().transform(Number),
});

const copyPrevious = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

const refereeParams = z.object({
  refereeId: z.string().uuid("Invalid referee ID format."),
});

const availabilityIdParams = z.object({
  id: z.string().uuid("Invalid availability ID format."),
});

const requestsQuery = z.object({
  status: z
    .enum(["all", "pending", "approved", "rejected"])
    .optional()
    .default("pending"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const reviewRequests = z.object({
  ids: z
    .array(z.string().uuid("Invalid availability ID format."))
    .min(1, "At least one request is required."),
  approvalStatus: z.enum(["approved", "rejected"]),
});

module.exports = {
  setAvailability,
  setAvailabilityRange,
  calendarQuery,
  copyPrevious,
  refereeParams,
  availabilityIdParams,
  requestsQuery,
  reviewRequests,
};

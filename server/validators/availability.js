const { z } = require("zod");

const setAvailability = z.object({
  date: z.string({ required_error: "Date is required." }),
  isAvailable: z.boolean({
    required_error: "Availability status is required.",
  }),
  reason: z.string().optional().nullable(),
});

const setAvailabilityRange = z.object({
  dateFrom: z.string({ required_error: "Start date is required." }),
  dateTo: z.string({ required_error: "End date is required." }),
  isAvailable: z.boolean({
    required_error: "Availability status is required.",
  }),
  reason: z.string().optional().nullable(),
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

module.exports = {
  setAvailability,
  setAvailabilityRange,
  calendarQuery,
  copyPrevious,
  refereeParams,
};

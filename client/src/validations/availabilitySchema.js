import { z } from "zod";

export const availabilityRequestDefaultValues = {
  dateFrom: "",
  dateTo: "",
  reason: "",
  description: "",
};

const getAcceptedMatchConflictMessage = (dates) => {
  const visibleDates = dates.slice(0, 3).join(", ");
  const remainingCount = dates.length - 3;
  const suffix = remainingCount > 0 ? ` and ${remainingCount} more` : "";

  return `You already accepted a match on ${visibleDates}${suffix}. Choose dates without accepted matches.`;
};

export const createAvailabilityRequestSchema = (
  todayKey,
  acceptedMatchDateKeys = [],
) => {
  const acceptedMatchDates = [...new Set(acceptedMatchDateKeys)].sort();

  return z
    .object({
      dateFrom: z.string().min(1, "From date is required."),
      dateTo: z.string().min(1, "To date is required."),
      reason: z.string().min(1, "Reason is required."),
      description: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.dateFrom && data.dateFrom < todayKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateFrom"],
          message: "Choose today or a future date.",
        });
      }

      if (data.dateTo && data.dateTo < todayKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateTo"],
          message: "Choose today or a future date.",
        });
      }

      if (data.dateFrom && data.dateTo && data.dateFrom > data.dateTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateTo"],
          message: "The end date must be on or after the start date.",
        });
      }

      if (data.dateFrom && data.dateTo && data.dateFrom <= data.dateTo) {
        const conflicts = acceptedMatchDates.filter(
          (dateKey) => data.dateFrom <= dateKey && dateKey <= data.dateTo,
        );

        if (conflicts.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["dateTo"],
            message: getAcceptedMatchConflictMessage(conflicts),
          });
        }
      }
    });
};

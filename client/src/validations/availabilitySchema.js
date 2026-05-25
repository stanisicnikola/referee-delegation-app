import { z } from "zod";

export const availabilityRequestDefaultValues = {
  dateFrom: "",
  dateTo: "",
  reason: "",
  description: "",
};

export const createAvailabilityRequestSchema = (todayKey) =>
  z
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
    });

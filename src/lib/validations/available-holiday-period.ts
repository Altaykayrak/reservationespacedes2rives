
import * as z from "zod";

export const availableHolidayPeriodSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  start_date: z.date({
    required_error: "La date de début est requise",
  }),
  end_date: z.date({
    required_error: "La date de fin est requise",
  }).superRefine((end_date, ctx) => {
    if (ctx.data.start_date && end_date < ctx.data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La date de fin doit être après la date de début",
      });
    }
  }),
  max_participants_kindergarten: z.number().min(0, "Le nombre ne peut pas être négatif"),
  max_participants_primary: z.number().min(0, "Le nombre ne peut pas être négatif"),
  max_participants_teen: z.number().min(0, "Le nombre ne peut pas être négatif"),
});

export type AvailableHolidayPeriod = z.infer<typeof availableHolidayPeriodSchema>;

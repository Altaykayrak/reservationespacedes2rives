
import * as z from "zod";

export const availableHolidayPeriodSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  start_date: z.date({
    required_error: "La date de début est requise",
  }),
  end_date: z.date({
    required_error: "La date de fin est requise",
  }).refine((end_date, ctx) => {
    const { start_date } = ctx.parent;
    if (!start_date || !end_date) return true;
    if (end_date < start_date) {
      return false;
    }
    return true;
  }, {
    message: "La date de fin doit être après la date de début",
  }),
  max_participants_kindergarten: z.number().min(0, "Le nombre ne peut pas être négatif"),
  max_participants_primary: z.number().min(0, "Le nombre ne peut pas être négatif"),
  max_participants_teen: z.number().min(0, "Le nombre ne peut pas être négatif"),
});

export type AvailableHolidayPeriod = z.infer<typeof availableHolidayPeriodSchema>;

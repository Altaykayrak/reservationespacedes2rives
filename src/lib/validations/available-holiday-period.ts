
import * as z from "zod";

export const availableHolidayPeriodSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  start_date: z.date({
    required_error: "La date de début est requise",
  }),
  end_date: z.date({
    required_error: "La date de fin est requise",
  }),
  max_participants_kindergarten: z.number().min(0, "Le nombre ne peut pas être négatif"),
  max_participants_primary: z.number().min(0, "Le nombre ne peut pas être négatif"),
  max_participants_teen: z.number().min(0, "Le nombre ne peut pas être négatif"),
}).refine(data => {
  // Vérification que la date de fin est après la date de début
  if (data.start_date && data.end_date) {
    return data.end_date >= data.start_date;
  }
  return true;
}, {
  message: "La date de fin doit être après la date de début",
  path: ["end_date"]
});

export type AvailableHolidayPeriod = z.infer<typeof availableHolidayPeriodSchema>;

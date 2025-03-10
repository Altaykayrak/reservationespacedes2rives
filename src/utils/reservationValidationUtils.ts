
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { validateMinimumDaysPerWeek } from "@/utils/dateUtils";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const validateSelectedChild = (selectedChild: string): string | null => {
  if (!selectedChild) {
    return "Veuillez sélectionner un enfant.";
  }
  return null;
};

export const validateSelectedDates = (selectedDates: DateOption[]): string | null => {
  if (selectedDates.length === 0) {
    return "Veuillez sélectionner au moins une date.";
  }
  return null;
};

export const validateNotAlreadyReserved = (
  selectedDates: DateOption[],
  isDateAlreadyReserved: (date: Date) => boolean
): string | null => {
  const alreadyReservedDates = selectedDates.filter(dateOption => 
    isDateAlreadyReserved(dateOption.date)
  );

  if (alreadyReservedDates.length > 0) {
    const datesList = alreadyReservedDates
      .map(d => format(d.date, "d MMMM yyyy", { locale: fr }))
      .join(", ");
    
    return `Les dates suivantes sont déjà réservées pour cet enfant : ${datesList}`;
  }
  
  return null;
};

export const validateMinimumDays = (
  selectedDates: DateOption[],
  isAdminRoute: boolean
): boolean => {
  return validateMinimumDaysPerWeek(selectedDates.map(d => d.date), isAdminRoute);
};


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
  // Ajouter des logs pour débogage
  console.log("validateMinimumDays - selectedDates:", selectedDates);
  console.log("validateMinimumDays - isAdminRoute:", isAdminRoute);
  
  // S'assurer que les dates sont bien des objets Date
  const validDates = selectedDates
    .filter(d => d && d.date instanceof Date && !isNaN(d.date.getTime()))
    .map(d => d.date);
  
  console.log("validateMinimumDays - validDates count:", validDates.length);
  
  // Utiliser la fonction existante avec les dates validées
  return validateMinimumDaysPerWeek(validDates, isAdminRoute);
};

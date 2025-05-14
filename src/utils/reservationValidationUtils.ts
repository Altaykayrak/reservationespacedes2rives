
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
  
  // Vérifier qu'il y a au moins 3 dates valides
  const validDates = selectedDates.filter(d => 
    d.date instanceof Date && !isNaN(d.date.getTime())
  );
  
  if (validDates.length < 3) {
    return "Veuillez sélectionner au moins 3 jours pour valider votre réservation.";
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
  console.log("validateMinimumDays - DÉMARRAGE avec %d dates", selectedDates.length);
  console.log("validateMinimumDays - selectedDates:", selectedDates);
  console.log("validateMinimumDays - isAdminRoute:", isAdminRoute);
  
  // Si le tableau est vide ou undefined, la validation échoue immédiatement
  if (!selectedDates || selectedDates.length === 0) {
    console.log("validateMinimumDays - pas de dates sélectionnées");
    return false;
  }
  
  // Exigence explicite de 3 jours minimum, SANS EXCEPTION
  if (selectedDates.length < 3) {
    console.log("validateMinimumDays - moins de 3 dates au total");
    return false;
  }
  
  // S'assurer que les dates sont bien des objets Date valides
  const validDates = selectedDates
    .filter(d => d && d.date instanceof Date && !isNaN(d.date.getTime()))
    .map(d => d.date);
  
  console.log("validateMinimumDays - validDates:", validDates.map(d => d.toISOString()));
  console.log("validateMinimumDays - validDates count:", validDates.length);
  
  // Si pas assez de dates valides (au moins 3), la validation échoue
  if (validDates.length < 3) {
    console.log("validateMinimumDays - moins de 3 dates valides");
    return false;
  }
  
  // Pour les administrateurs, on autorise moins de 3 jours par semaine
  if (isAdminRoute) {
    console.log("validateMinimumDays - route admin, validation OK");
    return true;
  }
  
  // Pour les utilisateurs normaux, on utilise la fonction existante avec les dates validées
  const result = validateMinimumDaysPerWeek(validDates, isAdminRoute);
  console.log("validateMinimumDays - résultat final:", result);
  return result;
};


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
  console.log("🔍 validateSelectedDates - Vérification de", selectedDates.length, "dates");
  
  if (selectedDates.length === 0) {
    console.log("🛑 validateSelectedDates - Aucune date sélectionnée");
    return "Veuillez sélectionner au moins une date.";
  }
  
  // Vérifier qu'il y a au moins une date valide (même si règle minimum désactivée)
  const validDates = selectedDates.filter(d => 
    d.date instanceof Date && !isNaN(d.date.getTime())
  );
  
  console.log("📊 validateSelectedDates - Dates valides:", validDates.length);
  
  if (validDates.length === 0) {
    console.log("🛑 validateSelectedDates - Aucune date valide");
    return "Veuillez sélectionner au moins une date valide pour votre réservation.";
  }
  
  return null;
};

export const validateNotAlreadyReserved = (
  selectedDates: DateOption[],
  isDateAlreadyReserved: (date: Date) => boolean
): string | null => {
  // Filtrer pour ne garder que les dates valides
  const validDates = selectedDates.filter(d => 
    d.date instanceof Date && !isNaN(d.date.getTime())
  );
  
  const alreadyReservedDates = validDates.filter(dateOption => 
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
  isAdminRoute: boolean,
  disableMinimumDaysRule: boolean = false
): boolean => {
  console.log("🔍 validateMinimumDays - DÉMARRAGE avec %d dates", selectedDates.length);
  console.log("🔍 validateMinimumDays - disableMinimumDaysRule:", disableMinimumDaysRule);
  
  // Si le tableau est vide ou undefined, la validation échoue immédiatement
  if (!selectedDates || selectedDates.length === 0) {
    console.log("🛑 validateMinimumDays - pas de dates sélectionnées");
    return false;
  }
  
  // S'assurer que les dates sont bien des objets Date valides
  const validDates = selectedDates
    .filter(d => d && d.date instanceof Date && !isNaN(d.date.getTime()))
    .map(d => d.date);
  
  console.log("📊 validateMinimumDays - validDates count:", validDates.length);
  
  // Si pas de dates valides (au moins 1), la validation échoue
  if (validDates.length === 0) {
    console.log("🛑 validateMinimumDays - aucune date valide");
    return false;
  }
  
  // Pour les administrateurs ou si la règle est désactivée, on autorise moins de 3 jours par semaine
  if (isAdminRoute || disableMinimumDaysRule) {
    console.log("✅ validateMinimumDays - règle ignorée (admin ou désactivée), validation OK");
    return true;
  }
  
  // Exigence de 3 jours minimum pour les utilisateurs normaux
  if (validDates.length < 3) {
    console.log("🛑 validateMinimumDays - moins de 3 dates au total pour utilisateur standard");
    return false;
  }
  
  // Pour les utilisateurs normaux, on utilise la fonction existante avec les dates validées
  const result = validateMinimumDaysPerWeek(validDates, isAdminRoute);
  console.log("✅ validateMinimumDays - résultat final:", result);
  return result;
};

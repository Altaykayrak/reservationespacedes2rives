import { startOfWeek, endOfWeek, eachDayOfInterval, isWeekend } from "date-fns";

export const getWeeksFromDates = (dates: Date[]) => {
  // Group dates by week
  const weekMap = new Map<string, Date[]>();
  
  dates.forEach(date => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }).toISOString(); // Start week on Monday
    const existingDates = weekMap.get(weekStart) || [];
    weekMap.set(weekStart, [...existingDates, date]);
  });

  return Array.from(weekMap.values());
};

export const validateHolidayReservations = (selectedDates: Date[], existingReservations: Date[] = []) => {
  // Regrouper toutes les dates par semaine
  const weekMap = new Map<string, Date[]>();
  
  // D'abord, ajouter les réservations existantes
  existingReservations.forEach(date => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
    const existingDates = weekMap.get(weekStart) || [];
    weekMap.set(weekStart, [...existingDates, date]);
  });

  // Ensuite, vérifier chaque date sélectionnée
  for (const date of selectedDates) {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
    const existingDatesForWeek = weekMap.get(weekStart) || [];
    
    // Si on n'a pas déjà 3 jours réservés pour cette semaine
    if (existingDatesForWeek.length < 3) {
      // On doit s'assurer qu'avec les nouvelles sélections, on atteint au moins 3 jours
      const allSelectedDatesForWeek = selectedDates.filter(d => 
        startOfWeek(d, { weekStartsOn: 1 }).toISOString() === weekStart
      );
      
      if (allSelectedDatesForWeek.length < 3) {
        return {
          isValid: false,
          message: "Vous devez sélectionner au moins 3 jours pour chaque nouvelle semaine de réservation.",
        };
      }
    }
    
    // Mettre à jour le weekMap avec la nouvelle date
    weekMap.set(weekStart, [...existingDatesForWeek, date]);
  }

  return {
    isValid: true,
    message: "",
  };
};
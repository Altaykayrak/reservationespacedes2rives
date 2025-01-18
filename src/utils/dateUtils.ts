import { startOfWeek, endOfWeek, eachDayOfInterval, isWeekend, addDays, isSameDay } from "date-fns";

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

const getWorkdaysInWeek = (startDate: Date): Date[] => {
  const workdays: Date[] = [];
  let currentDate = startDate;

  // Add 5 workdays (Monday to Friday)
  for (let i = 0; i < 5; i++) {
    workdays.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return workdays;
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

  // Pour chaque date sélectionnée
  for (const date of selectedDates) {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekStartKey = weekStart.toISOString();
    const existingDatesForWeek = weekMap.get(weekStartKey) || [];
    
    // Si on n'a pas déjà 3 jours réservés pour cette semaine
    if (existingDatesForWeek.length < 3) {
      // Obtenir tous les jours ouvrés de la semaine (lundi au vendredi)
      const workdays = getWorkdaysInWeek(weekStart);
      
      // Filtrer les dates sélectionnées qui font partie de cette semaine
      const selectedDatesInWeek = selectedDates.filter(selectedDate => 
        workdays.some(workday => isSameDay(selectedDate, workday))
      );

      // Vérifier si on a au moins 3 jours sélectionnés dans la semaine
      if (selectedDatesInWeek.length < 3) {
        return {
          isValid: false,
          message: "Vous devez sélectionner au moins 3 jours du lundi au vendredi pour chaque nouvelle semaine de réservation.",
        };
      }
    }
    
    // Mettre à jour le weekMap avec la nouvelle date
    weekMap.set(weekStartKey, [...existingDatesForWeek, date]);
  }

  return {
    isValid: true,
    message: "",
  };
};
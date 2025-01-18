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
  
  // Pour chaque date sélectionnée
  for (const date of selectedDates) {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekStartKey = weekStart.toISOString();
    
    // Obtenir tous les jours ouvrés de la semaine (lundi au vendredi)
    const workdays = getWorkdaysInWeek(weekStart);
    
    // Trouver les réservations existantes pour cette semaine
    const existingDatesForWeek = existingReservations.filter(existingDate => 
      workdays.some(workday => isSameDay(existingDate, workday))
    );

    // Trouver les nouvelles dates sélectionnées pour cette semaine
    const selectedDatesInWeek = selectedDates.filter(selectedDate => 
      workdays.some(workday => isSameDay(selectedDate, workday))
    );

    // Calculer le nombre total de jours réservés pour cette semaine
    const totalDaysForWeek = new Set([
      ...existingDatesForWeek.map(d => d.toISOString()),
      ...selectedDatesInWeek.map(d => d.toISOString())
    ]).size;

    // Vérifier si on a au moins 3 jours au total pour cette semaine
    if (totalDaysForWeek < 3) {
      return {
        isValid: false,
        message: "Vous devez avoir au moins 3 jours réservés du lundi au vendredi pour chaque semaine.",
      };
    }
  }

  return {
    isValid: true,
    message: "",
  };
};
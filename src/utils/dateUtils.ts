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
  // Regrouper toutes les dates (nouvelles et existantes) par semaine
  const weekMap = new Map<string, Date[]>();
  
  [...selectedDates, ...existingReservations].forEach(date => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
    const existingDates = weekMap.get(weekStart) || [];
    weekMap.set(weekStart, [...existingDates, date]);
  });

  // Vérifier chaque semaine
  for (const [weekStart, weekDates] of weekMap.entries()) {
    const uniqueDates = Array.from(new Set(weekDates.map(d => d.toISOString()))).map(d => new Date(d));
    const existingDatesForWeek = existingReservations.filter(d => 
      startOfWeek(d, { weekStartsOn: 1 }).toISOString() === weekStart
    );

    // Si on a déjà 3 jours ou plus réservés pour cette semaine, on autorise l'ajout
    if (existingDatesForWeek.length >= 3) {
      continue;
    }

    // Sinon, on vérifie qu'on a au moins 3 jours au total
    if (uniqueDates.length < 3) {
      return {
        isValid: false,
        message: "Vous devez réserver au moins 3 jours par semaine pendant les vacances.",
      };
    }
  }

  return {
    isValid: true,
    message: "",
  };
};
import { startOfWeek, endOfWeek, eachDayOfInterval, isWeekend, addDays, isSameDay } from "date-fns";

export const getWeeksFromDates = (dates: Date[]): Date[][] => {
  if (!dates.length) return [];

  // Trier les dates
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  let currentWeekNumber = -1;

  sortedDates.forEach(date => {
    const weekNumber = getWeekNumber(date);
    
    if (weekNumber !== currentWeekNumber) {
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
      currentWeek = [date];
      currentWeekNumber = weekNumber;
    } else {
      currentWeek.push(date);
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
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
  if (selectedDates.length < 3) {
    return {
      isValid: false,
      message: "Vous devez sélectionner au moins 3 jours pour la période de vacances.",
    };
  }

  // Vérifier que toutes les dates sont dans la même période de vacances
  const firstDate = selectedDates[0];
  const weekStart = startOfWeek(firstDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(firstDate, { weekStartsOn: 1 });

  // Vérifier que toutes les dates sélectionnées sont dans la même période
  const allDatesInSamePeriod = selectedDates.every(date => {
    return date >= weekStart && date <= weekEnd;
  });

  if (!allDatesInSamePeriod) {
    return {
      isValid: false,
      message: "Toutes les dates sélectionnées doivent appartenir à la même période de vacances.",
    };
  }

  // Vérifier les réservations existantes
  const allDates = [...selectedDates, ...existingReservations];
  const uniqueDates = new Set(allDates.map(d => d.toISOString()));

  if (uniqueDates.size < 3) {
    return {
      isValid: false,
      message: "Vous devez avoir au moins 3 jours réservés pour cette période de vacances.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};
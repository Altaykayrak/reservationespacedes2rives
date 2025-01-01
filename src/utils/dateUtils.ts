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

export const validateHolidayReservations = (selectedDates: Date[]) => {
  const weeks = getWeeksFromDates(selectedDates);
  
  // Check each week has at least 3 days selected
  const invalidWeeks = weeks.filter(weekDates => weekDates.length < 3);
  
  if (invalidWeeks.length > 0) {
    return {
      isValid: false,
      message: "Vous devez réserver au moins 3 jours par semaine pendant les vacances.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};
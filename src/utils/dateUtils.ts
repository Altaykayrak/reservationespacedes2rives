import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns";

export const getWorkdaysInWeek = (weekStart: Date) => {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  return days.filter(day => {
    const dayOfWeek = day.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude Saturday (6) and Sunday (0)
  });
};

export const getWeeksFromDates = (dates: Date[]) => {
  const weekMap = new Map<string, Date[]>();

  dates.forEach(date => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekKey = weekStart.toISOString();
    const existingDates = weekMap.get(weekKey) || [];
    weekMap.set(weekKey, [...existingDates, date]);
  });

  return Array.from(weekMap.values());
};

export const validateHolidayReservations = (
  selectedDates: Date[], 
  existingReservations: Date[] = [],
  holidayPeriod: { start_date: string; end_date: string }
) => {
  // Convert holiday period dates to Date objects
  const periodStart = new Date(holidayPeriod.start_date);
  const periodEnd = new Date(holidayPeriod.end_date);

  // Verify all selected dates are within the holiday period
  const allDatesInPeriod = selectedDates.every(date =>
    isWithinInterval(date, { start: periodStart, end: periodEnd })
  );

  if (!allDatesInPeriod) {
    return {
      isValid: false,
      message: "Toutes les dates sélectionnées doivent appartenir à la même période de vacances.",
    };
  }

  // Get existing reservations within this period
  const existingReservationsInPeriod = existingReservations.filter(date =>
    isWithinInterval(date, { start: periodStart, end: periodEnd })
  );

  // Count total unique dates (selected + existing) within the period
  const uniqueDatesInPeriod = new Set([
    ...selectedDates.map(d => d.toISOString()),
    ...existingReservationsInPeriod.map(d => d.toISOString())
  ]);

  if (uniqueDatesInPeriod.size < 3) {
    return {
      isValid: false,
      message: "Vous devez sélectionner au minimum 3 jours sur cette période de vacances.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};
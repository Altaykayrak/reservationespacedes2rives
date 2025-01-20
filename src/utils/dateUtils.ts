import { startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from "date-fns";
import { SupabaseClient } from "@supabase/supabase-js";

export const getWorkdaysInWeek = (weekStart: Date) => {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  return days.filter(day => {
    const dayOfWeek = day.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
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

interface HolidayPeriod {
  id: string;
  start_date: string;
  end_date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
  max_participants_teen: number;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

const isWorkingDay = (date: Date): boolean => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
};

export const validateHolidayReservations = async (
  selectedDates: Date[],
  holidayPeriod: HolidayPeriod,
  childSchoolClass: string,
  supabase: SupabaseClient
): Promise<ValidationResult> => {
  // 1. Vérifier que toutes les dates sont des jours ouvrables
  const nonWorkingDays = selectedDates.filter(date => !isWorkingDay(date));
  if (nonWorkingDays.length > 0) {
    return {
      isValid: false,
      message: "Les réservations ne sont possibles que les jours ouvrables (lundi à vendredi)."
    };
  }

  // 2. Vérifier que toutes les dates sont dans la période
  const periodStart = new Date(holidayPeriod.start_date);
  const periodEnd = new Date(holidayPeriod.end_date);

  const allDatesInPeriod = selectedDates.every(date =>
    isWithinInterval(date, { start: periodStart, end: periodEnd })
  );

  if (!allDatesInPeriod) {
    return {
      isValid: false,
      message: "Toutes les dates sélectionnées doivent appartenir à la même période de vacances."
    };
  }

  // 3. Vérifier le minimum de 3 jours ouvrables
  const workingDaysCount = selectedDates.filter(date => isWorkingDay(date)).length;
  if (workingDaysCount < 3) {
    return {
      isValid: false,
      message: "Vous devez sélectionner au minimum 3 jours ouvrables sur cette période de vacances."
    };
  }

  // 4. Vérifier le nombre maximum de participants par niveau
  let maxParticipants: number;
  if (["Petite Section", "Moyenne Section", "Grande Section"].includes(childSchoolClass)) {
    maxParticipants = holidayPeriod.max_participants_kindergarten;
  } else if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(childSchoolClass)) {
    maxParticipants = holidayPeriod.max_participants_primary;
  } else {
    maxParticipants = holidayPeriod.max_participants_teen;
  }

  // Vérifier chaque date individuellement
  for (const date of selectedDates) {
    const { data: existingReservations, error } = await supabase
      .from('reservations')
      .select('id, children!inner(school_class)')
      .eq('reservation_date', date.toISOString().split('T')[0])
      .eq('period_id', holidayPeriod.id)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Error checking reservations:', error);
      return {
        isValid: false,
        message: "Une erreur est survenue lors de la vérification des réservations."
      };
    }

    const currentCount = existingReservations.length;

    if (currentCount >= maxParticipants) {
      return {
        isValid: false,
        message: `Le nombre maximum de participants est atteint pour le ${date.toLocaleDateString('fr-FR')}. Veuillez choisir une autre date.`
      };
    }
  }

  return {
    isValid: true,
    message: ""
  };
};
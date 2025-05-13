
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

export const validateMinimumDaysPerWeek = (dates: Date[], isAdmin: boolean = false): boolean => {
  // Si c'est un admin, on ne vérifie pas le minimum de jours
  if (isAdmin) {
    return true;
  }
  
  // Vérification plus stricte pour s'assurer qu'on a bien des dates
  if (!dates || dates.length === 0) {
    return false;
  }
  
  // Regrouper les dates par semaine
  const weeks = getWeeksFromDates(dates);
  
  // Vérifier que chaque semaine contient au moins 3 jours
  // Imprimer les semaines pour le débogage
  console.log("Weeks validation:", weeks.map(weekDates => {
    return {
      count: weekDates.length,
      dates: weekDates.map(d => d.toISOString().split('T')[0])
    };
  }));
  
  return weeks.every(weekDates => weekDates.length >= 3);
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
  holidayPeriods: HolidayPeriod[],
  childSchoolClass: string,
  supabase: SupabaseClient,
  isAdmin: boolean = false
): Promise<ValidationResult> => {
  // 1. Vérifier que toutes les dates sont des jours ouvrables
  const nonWorkingDays = selectedDates.filter(date => !isWorkingDay(date));
  if (nonWorkingDays.length > 0) {
    return {
      isValid: false,
      message: "Les réservations ne sont possibles que les jours ouvrables (lundi à vendredi)."
    };
  }

  // 2. Regrouper les dates par période de vacances
  const datesByPeriod = new Map<string, Date[]>();
  
  selectedDates.forEach(date => {
    const period = holidayPeriods.find(period => {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return isWithinInterval(date, { start: startDate, end: endDate });
    });

    if (period) {
      const existingDates = datesByPeriod.get(period.id) || [];
      datesByPeriod.set(period.id, [...existingDates, date]);
    }
  });

  // 3. Vérifier que toutes les dates appartiennent à une période
  if (datesByPeriod.size === 0) {
    return {
      isValid: false,
      message: "Les dates sélectionnées doivent appartenir à une période de vacances."
    };
  }

  // 4. Vérifier le nombre minimum de jours par période (3 jours) sauf pour les admins
  if (!isAdmin) {
    for (const [periodId, dates] of datesByPeriod.entries()) {
      if (dates.length < 3) {
        return {
          isValid: false,
          message: "Vous devez sélectionner au minimum 3 jours sur une même période de vacances."
        };
      }
    }
  }

  // 5. Vérifier le nombre maximum de participants par niveau pour chaque période
  for (const [periodId, dates] of datesByPeriod.entries()) {
    const period = holidayPeriods.find(p => p.id === periodId);
    if (!period) continue;

    let maxParticipants: number;
    if (["Petite Section", "Moyenne Section", "Grande Section"].includes(childSchoolClass)) {
      maxParticipants = period.max_participants_kindergarten;
    } else if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(childSchoolClass)) {
      maxParticipants = period.max_participants_primary;
    } else {
      maxParticipants = period.max_participants_teen;
    }

    // Vérifier chaque date individuellement
    for (const date of dates) {
      const { data: existingReservations, error } = await supabase
        .from('reservations')
        .select('id, children!inner(school_class)')
        .eq('reservation_date', date.toISOString().split('T')[0])
        .eq('period_id', periodId)
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
  }

  return {
    isValid: true,
    message: ""
  };
};

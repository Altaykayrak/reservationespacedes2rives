
import { startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, format } from "date-fns";
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
  if (!dates || dates.length === 0) {
    console.log("getWeeksFromDates - Pas de dates fournies");
    return [];
  }
  
  // Debug logs
  console.log("getWeeksFromDates - Dates reçues:", 
    dates.map(d => format(d, 'yyyy-MM-dd'))
  );
  
  const weekMap = new Map<string, Date[]>();

  dates.forEach(date => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekKey = weekStart.toISOString();
    const existingDates = weekMap.get(weekKey) || [];
    weekMap.set(weekKey, [...existingDates, date]);
  });

  // Debug du résultat
  const result = Array.from(weekMap.values());
  console.log("getWeeksFromDates - Semaines générées:", 
    result.map(week => ({
      weekCount: week.length,
      dates: week.map(d => format(d, 'yyyy-MM-dd'))
    }))
  );
  
  return result;
};

export const validateMinimumDaysPerWeek = (dates: Date[], isAdmin: boolean = false, excludedDates: string[] = []): boolean => {
  // Vérifications de base
  console.log("validateMinimumDaysPerWeek - dates:", dates ? dates.map(d => d.toISOString()) : "undefined");
  console.log("validateMinimumDaysPerWeek - isAdmin:", isAdmin);
  
  // Si c'est un admin, on ne vérifie pas le minimum de jours
  if (isAdmin) {
    console.log("validateMinimumDaysPerWeek - Admin détecté, validation ignorée");
    return true;
  }
  
  // Vérification plus stricte pour s'assurer qu'on a bien des dates
  if (!dates || dates.length === 0) {
    console.log("validateMinimumDaysPerWeek - Pas de dates fournies");
    return false;
  }
  
  // Si une seule date est sélectionnée, la validation échoue automatiquement car < 3
  // Sauf si le nombre de jours disponibles dans la semaine est inférieur à 3
  if (dates.length < 3 && excludedDates.length === 0) {
    console.log("validateMinimumDaysPerWeek - Moins de 3 dates au total, validation impossible");
    return false;
  }
  
  // Regrouper les dates par semaine
  const weeks = getWeeksFromDates(dates);
  
  // Vérification spécifique de chaque semaine
  const weekValidations = weeks.map(weekDates => {
    // Calculate available workdays in this week (excluding closed dates)
    const weekStart = startOfWeek(weekDates[0], { weekStartsOn: 1 });
    const workdaysInWeek = getWorkdaysInWeek(weekStart);
    const availableWorkdays = workdaysInWeek.filter(d => {
      const ds = format(d, 'yyyy-MM-dd');
      return !excludedDates.includes(ds);
    });
    const requiredMinimum = Math.min(3, availableWorkdays.length);
    const isValid = weekDates.length >= requiredMinimum;
    console.log(`validateMinimumDaysPerWeek - Semaine avec ${weekDates.length}/${availableWorkdays.length} jour(s), minimum requis: ${requiredMinimum}: ${isValid ? 'VALIDE' : 'INVALIDE'}`);
    return isValid;
  });
  
  // Vérification finale: toutes les semaines doivent avoir au moins 3 jours
  const result = weeks.length > 0 && weekValidations.every(isValid => isValid);
  console.log("validateMinimumDaysPerWeek - Résultat final:", result);
  return result;
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

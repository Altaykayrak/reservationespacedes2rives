
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export interface ReservationResult {
  success: boolean;
  error?: string;
  noSpots?: {
    schoolClass: string;
    date: Date;
  };
  periodId?: string;
  periodName?: string;
  childData?: any;
  successfulReservations?: any[];
  reservationNumber?: string;
}

export const createHolidayReservations = async (
  selectedChild: string,
  selectedDates: DateOption[],
  holidayPeriods: any[] | null | undefined,
  submissionTimestamp: number
): Promise<ReservationResult> => {
  try {
    const { data: childData, error: childError } = await supabase
      .from("children")
      .select("first_name, last_name, school_class")
      .eq("id", selectedChild)
      .single();

    if (childError) throw childError;

    // Récupérer les informations de période pour l'email
    let periodName = "";
    let periodId = "";
    if (holidayPeriods && selectedDates.length > 0) {
      const firstDate = selectedDates[0].date;
      const period = holidayPeriods.find(period => {
        const startDate = new Date(period.start_date);
        const endDate = new Date(period.end_date);
        return firstDate >= startDate && firstDate <= endDate;
      });
      
      if (period) {
        periodId = period.id;
        periodName = `${format(new Date(period.start_date), "d MMMM yyyy", { locale: fr })} au ${format(new Date(period.end_date), "d MMMM yyyy", { locale: fr })}`;
        console.log(`DEBUG: Période identifiée: ${periodName}, ID: ${periodId} (timestamp: ${submissionTimestamp})`);
      }
    }

    // Generate a unique reservation number for this batch
    const reservationNumber = `HOL-${Date.now().toString().substring(5)}`;
    console.log(`DEBUG: Numéro de réservation généré: ${reservationNumber} (timestamp: ${submissionTimestamp})`);

    // Store successful reservations
    const successfulReservations = [];

    // Check available spots for each date and create reservations
    for (const dateOption of selectedDates) {
      const dateStr = format(dateOption.date, "yyyy-MM-dd");
      console.log(`DEBUG: Traitement de la date ${dateStr} (timestamp: ${submissionTimestamp})`);
      
      // Find the period for this date
      const period = holidayPeriods?.find(period => {
        const startDate = new Date(period.start_date);
        const endDate = new Date(period.end_date);
        const currentDate = new Date(dateStr);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        return currentDate >= startDate && currentDate <= endDate;
      });

      if (!period) {
        throw new Error(`Période non trouvée pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
      }

      // Déterminer la catégorie de la classe (maternelle, primaire, ado)
      let classGroup = '';
      const schoolClass = childData.school_class;
      
      if (['PS', 'MS', 'GS'].includes(schoolClass)) {
        classGroup = 'kindergarten';
      } else if (['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(schoolClass)) {
        classGroup = 'primary';
      } else {
        classGroup = 'teen';
      }
      
      // Récupérer le maximum de places pour ce groupe
      const { data: periodData, error: periodError } = await supabase
        .from("available_holiday_periods")
        .select(`max_participants_${classGroup}`)
        .eq("id", period.id)
        .single();
        
      if (periodError) throw periodError;
      
      const maxSpots = periodData[`max_participants_${classGroup}`];
      
      // Vérifier les réservations existantes pour ce groupe et cette date
      const { data: reservations, error: reservationsError } = await supabase
        .from("holiday_reservations")
        .select("id, child:children(school_class)")
        .eq("period_id", period.id)
        .eq("reservation_date", dateStr)
        .eq("status", "confirmed");
        
      if (reservationsError) throw reservationsError;
      
      // Filtrer les réservations par groupe de classe
      const reservationsCount = reservations.filter(res => {
        const resClass = res.child?.school_class;
        if (!resClass) return false;
        
        if (classGroup === 'kindergarten') {
          return ['PS', 'MS', 'GS'].includes(resClass);
        } else if (classGroup === 'primary') {
          return ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(resClass);
        } else {
          return !['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(resClass);
        }
      }).length;
      
      // Calculer les places restantes
      const spotsLeft = maxSpots - reservationsCount;

      if (spotsLeft <= 0) {
        return {
          success: false,
          noSpots: {
            schoolClass: schoolClass,
            date: dateOption.date
          }
        };
      }

      // Check if reservation already exists
      const { data: existingReservation, error: checkError } = await supabase
        .from("holiday_reservations")
        .select()
        .eq("child_id", selectedChild)
        .eq("period_id", period.id)
        .eq("reservation_date", dateStr)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingReservation) {
        throw new Error(`Une réservation existe déjà pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
      }

      // Create the reservation in the database
      console.log(`DEBUG: Création de la réservation dans la base de données pour la date ${dateStr} (timestamp: ${submissionTimestamp})`);
      const { data: insertedReservation, error: insertError } = await supabase
        .from("holiday_reservations")
        .insert({
          child_id: selectedChild,
          period_id: period.id,
          reservation_date: dateStr,
          reservation_number: reservationNumber,
          without_meal: dateOption.withoutMeal,
          early_dropoff: dateOption.earlyDropoff,
          status: "confirmed"
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      console.log(`DEBUG: Réservation créée avec succès pour la date ${dateStr}, ID: ${insertedReservation?.id} (timestamp: ${submissionTimestamp})`);
      
      if (insertedReservation) {
        successfulReservations.push(insertedReservation);
      }
    }

    return {
      success: true,
      childData,
      periodId,
      periodName,
      successfulReservations,
      reservationNumber
    };
  } catch (error: any) {
    console.error(`DEBUG: Erreur lors de la création des réservations: ${error.message} (timestamp: ${submissionTimestamp})`);
    return {
      success: false,
      error: error.message || "Une erreur est survenue lors de la création des réservations."
    };
  }
};

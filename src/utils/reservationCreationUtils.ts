
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
    console.log(`🔄 createHolidayReservations - Début avec ${selectedDates.length} dates (timestamp: ${submissionTimestamp})`);
    console.log("📅 createHolidayReservations - Dates à réserver:", selectedDates.map(d => d.date.toISOString()));
    
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
        console.log(`🏷️ createHolidayReservations - Période identifiée: ${periodName}, ID: ${periodId} (timestamp: ${submissionTimestamp})`);
      }
    }

    // Generate a unique reservation number for this batch
    const reservationNumber = `HOL-${Date.now().toString().substring(5)}`;
    console.log(`🔢 createHolidayReservations - Numéro de réservation: ${reservationNumber} (timestamp: ${submissionTimestamp})`);

    // Store successful reservations
    const successfulReservations = [];

    // Check available spots for each date and create reservations
    for (const dateOption of selectedDates) {
      // S'assurer que la date est une instance valide de Date
      if (!(dateOption.date instanceof Date) || isNaN(dateOption.date.getTime())) {
        console.error(`❌ Date invalide détectée: ${dateOption.date}, ignorée`);
        continue;
      }
      
      const dateStr = format(dateOption.date, "yyyy-MM-dd");
      console.log(`📅 createHolidayReservations - Traitement de la date ${dateStr} (timestamp: ${submissionTimestamp})`);
      
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
        console.error(`❌ Période non trouvée pour la date ${dateStr}`);
        continue;
      }

      // Utiliser la fonction SQL corrigée pour vérifier les places disponibles
      console.log(`🔍 createHolidayReservations - Vérification des places avec les mappings spécifiques pour ${dateStr}`);
      const { data: spotsAvailable, error: spotsError } = await supabase.rpc(
        "check_holiday_spots_available",
        {
          p_period_id: period.id,
          p_reservation_date: dateStr,
          p_child_school_class: childData.school_class,
        }
      );

      if (spotsError) {
        console.error(`❌ Erreur lors de la vérification des places: ${spotsError.message}`);
        continue;
      }

      console.log(`📊 createHolidayReservations - Places restantes pour ${dateStr}, classe ${childData.school_class}: ${spotsAvailable}`);

      if (spotsAvailable <= 0) {
        return {
          success: false,
          noSpots: {
            schoolClass: childData.school_class,
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

      if (checkError) {
        console.error(`❌ Erreur lors de la vérification des réservations existantes: ${checkError.message}`);
        continue;
      }

      if (existingReservation) {
        console.log(`⚠️ Réservation existante pour la date ${dateStr}, ignorée`);
        continue;
      }

      // Create the reservation in the database
      console.log(`💾 createHolidayReservations - Création de la réservation pour la date ${dateStr} (timestamp: ${submissionTimestamp})`);
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

      if (insertError) {
        console.error(`❌ Erreur lors de l'insertion de la réservation: ${insertError.message}`);
        continue;
      }
      
      console.log(`✅ createHolidayReservations - Réservation créée avec succès pour la date ${dateStr}, ID: ${insertedReservation?.id} (timestamp: ${submissionTimestamp})`);
      
      if (insertedReservation) {
        successfulReservations.push(insertedReservation);
      }
    }

    console.log(`🎯 createHolidayReservations - ${successfulReservations.length} réservations créées avec succès sur ${selectedDates.length} demandées`);

    // Even if some dates failed, return success if at least one reservation was created
    return {
      success: successfulReservations.length > 0,
      childData,
      periodId,
      periodName,
      successfulReservations,
      reservationNumber,
      error: successfulReservations.length < selectedDates.length 
        ? `${selectedDates.length - successfulReservations.length} date(s) n'ont pas pu être réservées.` 
        : undefined
    };
  } catch (error: any) {
    console.error(`❌ createHolidayReservations - Erreur générale: ${error.message} (timestamp: ${submissionTimestamp})`);
    return {
      success: false,
      error: error.message || "Une erreur est survenue lors de la création des réservations."
    };
  }
};

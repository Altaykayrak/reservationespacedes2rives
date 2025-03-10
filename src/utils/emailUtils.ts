
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const sendHolidayReservationEmail = async (
  childFullName: string,
  selectedDates: DateOption[],
  periodName: string,
  reservationNumber: string,
  periodId: string,
  submissionTimestamp: number
) => {
  // Créer un requestId unique qui inclut toutes les informations pertinentes
  const requestId = `holiday-${childFullName}-${reservationNumber}-${periodId}-${submissionTimestamp}`;
  console.log(`DEBUG: Envoi d'email avec requestId: ${requestId} (timestamp: ${submissionTimestamp})`);
  
  const formattedDates = selectedDates.map(d => format(d.date, "EEEE d MMMM yyyy", { locale: fr }));
  
  const emailResponse = await supabase.functions.invoke('send-reservation-email', {
    body: {
      childName: childFullName,
      dates: formattedDates,
      reservationType: 'holiday',
      withoutMeal: selectedDates.map(d => d.withoutMeal),
      earlyDropoff: selectedDates.map(d => d.earlyDropoff),
      period: periodName,
      requestId
    }
  });
  
  console.log(`DEBUG: Réponse de l'email: ${JSON.stringify(emailResponse)} (timestamp: ${submissionTimestamp})`);
  return emailResponse;
};

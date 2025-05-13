
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
  submissionTimestamp: number,
  childSchoolClass: string // Class field
) => {
  // Create a unique requestId that includes all relevant information
  const requestId = `holiday-${childFullName}-${reservationNumber}-${periodId}-${submissionTimestamp}`;
  console.log(`DEBUG: Sending email with requestId: ${requestId} (timestamp: ${submissionTimestamp})`);
  
  // Format the dates for better readability in the email
  const formattedDates = selectedDates.map(d => format(d.date, "EEEE d MMMM yyyy", { locale: fr }));
  
  // Determine reservation type (standard or teen)
  const isTeenReservation = childSchoolClass === "6ème" || 
                           childSchoolClass === "5ème" || 
                           childSchoolClass === "4ème" || 
                           childSchoolClass === "3ème" ||
                           childSchoolClass.toUpperCase() === "CAP";
  
  const reservationType = isTeenReservation ? 'teen-holiday' : 'holiday';
  console.log(`DEBUG: Reservation type determined as: ${reservationType} for class ${childSchoolClass} (timestamp: ${submissionTimestamp})`);
  
  // Invoke the Supabase Edge Function to send the email
  const emailResponse = await supabase.functions.invoke('send-reservation-email', {
    body: {
      childName: childFullName,
      childClass: childSchoolClass,
      dates: formattedDates,
      reservationType: reservationType,
      withoutMeal: selectedDates.map(d => d.withoutMeal),
      earlyDropoff: selectedDates.map(d => d.earlyDropoff),
      period: periodName,
      requestId
    }
  });
  
  console.log(`DEBUG: Email response: ${JSON.stringify(emailResponse)} (timestamp: ${submissionTimestamp})`);
  return emailResponse;
};

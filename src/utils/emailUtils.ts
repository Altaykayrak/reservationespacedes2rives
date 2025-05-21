
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
  const formattedDates = selectedDates.map(d => {
    try {
      if (d.date instanceof Date && !isNaN(d.date.getTime())) {
        return format(d.date, "EEEE d MMMM yyyy", { locale: fr });
      } else {
        console.error(`DEBUG: Invalid date in selectedDates: ${d.date} (timestamp: ${submissionTimestamp})`);
        return "Date invalide";
      }
    } catch (error) {
      console.error(`DEBUG: Error formatting date: ${error} (timestamp: ${submissionTimestamp})`);
      return "Date invalide";
    }
  }).filter(date => date !== "Date invalide");
  
  // Determine reservation type (standard or teen)
  const isTeenReservation = childSchoolClass === "6ème" || 
                           childSchoolClass === "5ème" || 
                           childSchoolClass === "4ème" || 
                           childSchoolClass === "3ème" ||
                           childSchoolClass.toUpperCase() === "CAP" ||
                           childSchoolClass === "Seconde" ||
                           childSchoolClass === "Première" ||
                           childSchoolClass === "Terminale";
  
  const reservationType = isTeenReservation ? 'teen-holiday' : 'holiday';
  console.log(`DEBUG: Reservation type determined as: ${reservationType} for class ${childSchoolClass} (timestamp: ${submissionTimestamp})`);
  console.log(`DEBUG: About to invoke send-reservation-email function with ${formattedDates.length} valid dates`);
  
  try {
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
  } catch (error) {
    console.error(`DEBUG: Error sending email: ${error} (timestamp: ${submissionTimestamp})`);
    throw error;
  }
};

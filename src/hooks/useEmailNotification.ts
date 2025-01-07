import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const useEmailNotification = () => {
  const sendConfirmationEmail = async (
    childName: string,
    date: Date,
    reservationNumber: string,
    parentEmail?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-reservation-email", {
        body: {
          childName,
          reservationDate: format(date, "dd/MM/yyyy", { locale: fr }),
          reservationNumber,
          parentEmail,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      throw error;
    }
  };

  return { sendConfirmationEmail };
};
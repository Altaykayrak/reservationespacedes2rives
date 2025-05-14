
import { useState, useEffect } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";

export const useCM2ChildCheck = (
  selectedChild: string,
  children: Tables<"children">[] | null | undefined,
  selectedPeriodId: string,
  periodInfo: any,
  summerPeriods: string[],
  isHolidayReservation: boolean,
  isTeenHolidayReservation: boolean,
  isAdminTeenHolidayReservation: boolean,
  setSelectedDates?: (dates: any[]) => void,
  onCM2SummerPeriodCheck?: (isInSummerPeriod: boolean) => void
) => {
  const [showCM2Message, setShowCM2Message] = useState(false);
  const { isTeenClassSync } = useSchoolClassUtils();

  useEffect(() => {
    if (selectedChild && setSelectedDates) {
      // Reset dates when changing child
      setSelectedDates([]);
    }

    // Check if selected child is CM2 and on correct page
    const checkCM2TeenMapping = async () => {
      if (selectedChild) {
        const selectedChildData = children?.find(child => child.id === selectedChild);
        
        console.log("Checking CM2 child:", selectedChildData?.school_class, "for period:", periodInfo?.name);
        console.log("On summer period?", periodInfo?.name && summerPeriods.includes(periodInfo.name));
        
        // Vérifier si c'est un CM2 et si on est sur une période d'été spécifique
        if (selectedChildData?.school_class === "CM2" && selectedPeriodId) {
          // Vérifier si c'est une période d'été spécifique
          if (periodInfo?.name && summerPeriods.includes(periodInfo.name)) {
            console.log(`CM2 sur période d'été spécifique: ${periodInfo.name}`);
            
            if (isHolidayReservation) {
              // Sur la page de réservation normale, afficher le message de redirection vers Club Ado
              console.log("Affichage du message pour rediriger vers Club Ado");
              setShowCM2Message(true);
            } else if ((isTeenHolidayReservation || isAdminTeenHolidayReservation)) {
              // Sur la page Club Ado, configurer pour permettre la réservation
              setShowCM2Message(false);
            }
            
            if (onCM2SummerPeriodCheck) {
              // Notifier que c'est une période d'été pour CM2
              console.log("Notification CM2 période été:", true);
              onCM2SummerPeriodCheck(true);
            }
            return;
          }
        }
        
        // Si ce n'est pas une période spécifique ou pas un CM2, cacher le message
        setShowCM2Message(false);
        if (onCM2SummerPeriodCheck) {
          onCM2SummerPeriodCheck(false);
        }
      } else {
        setShowCM2Message(false);
        if (onCM2SummerPeriodCheck) {
          onCM2SummerPeriodCheck(false);
        }
      }
    };

    checkCM2TeenMapping();
  }, [selectedChild, setSelectedDates, children, isHolidayReservation, selectedPeriodId, periodInfo, onCM2SummerPeriodCheck, summerPeriods, isTeenHolidayReservation, isAdminTeenHolidayReservation]);

  return { showCM2Message };
};

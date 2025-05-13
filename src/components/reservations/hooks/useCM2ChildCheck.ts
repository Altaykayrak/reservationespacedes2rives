
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
        
        // Vérifier si c'est un CM2 et si on est sur une période d'été spécifique
        if (selectedChildData?.school_class === "CM2" && selectedPeriodId) {
          // Vérifier si c'est une période d'été spécifique
          if (periodInfo?.name && summerPeriods.includes(periodInfo.name)) {
            console.log(`CM2 sur période d'été spécifique: ${periodInfo.name}`);
            
            if (isHolidayReservation) {
              // Sur la page de réservation normale, afficher le message de redirection vers Club Ado
              setShowCM2Message(true);
            } else if ((isTeenHolidayReservation || isAdminTeenHolidayReservation)) {
              // Sur la page Club Ado, configurer pour permettre la réservation
              setShowCM2Message(false);
            }
            
            if (onCM2SummerPeriodCheck) {
              // Notifier que c'est une période d'été pour CM2
              onCM2SummerPeriodCheck(true);
            }
            return;
          }
          
          // Si ce n'est pas une période spécifique, utiliser la vérification normale
          try {
            const { isTeenClass } = await import("@/hooks/useSchoolClassUtils").then(module => module.useSchoolClassUtils());
            const isTeen = await isTeenClass(selectedChildData.school_class, selectedPeriodId);
            setShowCM2Message(isTeen && isHolidayReservation);
            if (onCM2SummerPeriodCheck) {
              onCM2SummerPeriodCheck(isTeen && (isTeenHolidayReservation || isAdminTeenHolidayReservation));
            }
          } catch (error) {
            console.error("Error checking teen class status:", error);
            setShowCM2Message(false);
            if (onCM2SummerPeriodCheck) {
              onCM2SummerPeriodCheck(false);
            }
          }
        } else {
          setShowCM2Message(false);
          if (onCM2SummerPeriodCheck) {
            onCM2SummerPeriodCheck(false);
          }
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

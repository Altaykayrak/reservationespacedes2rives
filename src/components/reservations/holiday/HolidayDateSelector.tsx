
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { HolidayPeriodProvider } from "./HolidayPeriodContext";
import { useHolidayClassification } from "./hooks/useHolidayClassification";
import { TeenClassDateSelector } from "./TeenClassDateSelector";
import { WorkdayDateSelector } from "./WorkdayDateSelector";
import { EmptyHolidayState } from "./EmptyHolidayState";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface HolidayDateSelectorProps {
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
  periodId: string;
  selectedChild: string;
  setSelectedDates: (dates: DateOption[]) => void;
}

export const HolidayDateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  periodId,
  selectedChild,
  setSelectedDates
}: HolidayDateSelectorProps) => {
  const [isCM2SummerPeriod, setIsCM2SummerPeriod] = useState(false);
  
  const { data: holidayPeriod } = useQuery({
    queryKey: ["holiday_period", periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .eq("id", periodId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!periodId
  });

  // Récupérer les informations de l'enfant, y compris la classe
  const { data: childInfo, isError: isChildInfoError } = useQuery({
    queryKey: ["child", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return null;
      console.log("Récupération des informations de l'enfant pour:", selectedChild);
      
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération des informations de l'enfant:", error);
        throw error;
      }
      
      if (!data?.school_class) {
        console.error("La classe scolaire est manquante pour l'enfant:", selectedChild);
        throw new Error("La classe scolaire est manquante");
      }
      
      console.log("Informations de l'enfant récupérées:", data);
      return data;
    },
    enabled: Boolean(selectedChild)
  });

  // Import our utility hook for teen class detection
  const { isTeenClassSync } = useSchoolClassUtils();

  // Vérifier si la période est une période d'été spéciale pour les CM2
  useEffect(() => {
    const checkSummerPeriod = async () => {
      if (!periodId || !childInfo) return;

      if (childInfo.school_class === "CM2") {
        try {
          const { data } = await supabase
            .from("available_holiday_periods")
            .select("name")
            .eq("id", periodId)
            .single();
          
          if (data && ["ETE-01", "ETE-02", "ETE-03", "ETE-04"].includes(data.name)) {
            console.log("CM2 en période d'été détecté:", data.name);
            setIsCM2SummerPeriod(true);
          } else {
            setIsCM2SummerPeriod(false);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de la période d'été:", error);
          setIsCM2SummerPeriod(false);
        }
      } else {
        setIsCM2SummerPeriod(false);
      }
    };
    
    checkSummerPeriod();
  }, [periodId, childInfo]);

  // Using the synchronous version of isTeenClass
  const isTeenClassValue = childInfo ? isTeenClassSync(childInfo.school_class, periodId) : false;

  // Effet pour réinitialiser les dates lors du changement d'enfant
  useEffect(() => {
    if (!selectedChild) return;

    const shouldUseSummerTeenLogic = (isTeenClassValue || isCM2SummerPeriod) && holidayPeriod;
    
    if (shouldUseSummerTeenLogic) {
      // On n'applique la présélection que sur la page teen
      const isTeenPage = window.location.pathname === "/teenholiday-reservations";
      if (isTeenPage) {
        console.log("Sélection des dates pour adolescent/CM2 en période d'été");
        const dates: DateOption[] = [];
        const startDate = new Date(holidayPeriod.start_date);
        const endDate = new Date(holidayPeriod.end_date);
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            dates.push({
              date: new Date(currentDate),
              withoutMeal: true,
              earlyDropoff: false
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setSelectedDates(dates);
      }
    } else {
      setSelectedDates([]);
    }
  }, [selectedChild, isTeenClassValue, holidayPeriod, setSelectedDates, isCM2SummerPeriod]);

  if (!holidayPeriod || !selectedChild) {
    return (
      <EmptyHolidayState 
        message="Sélection requise"
        subtitle="Veuillez sélectionner une période et un enfant."
      />
    );
  }

  if (!childInfo || isChildInfoError || !childInfo.school_class) {
    return (
      <EmptyHolidayState 
        message="Information manquante"
        subtitle="La classe de l'enfant n'est pas définie. Veuillez contacter l'administration."
      />
    );
  }

  // Déterminer le composant de sélection de dates à utiliser
  const isTeenHolidayPage = window.location.pathname === "/teenholiday-reservations";
  // Use the sync version here to avoid type issues
  const shouldUseTeenSelector = isTeenHolidayPage && (isTeenClassValue || isCM2SummerPeriod);

  return (
    <HolidayPeriodProvider 
      holidayPeriod={holidayPeriod} 
      childInfo={childInfo} 
      isTeenClass={isTeenClassValue || isCM2SummerPeriod}
    >
      {shouldUseTeenSelector ? (
        <TeenClassDateSelector
          selectedDates={selectedDates}
          isDateAlreadyReserved={isDateAlreadyReserved}
          handleOptionChange={handleOptionChange}
          handleDateToggle={handleDateToggle}
          periodId={periodId}
        />
      ) : (
        <WorkdayDateSelector
          selectedDates={selectedDates}
          handleDateToggle={handleDateToggle}
          handleOptionChange={handleOptionChange}
          isDateAlreadyReserved={isDateAlreadyReserved}
          periodId={periodId}
        />
      )}
    </HolidayPeriodProvider>
  );
};

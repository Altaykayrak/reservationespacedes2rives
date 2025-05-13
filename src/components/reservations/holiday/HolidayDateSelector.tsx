
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { HolidayPeriodProvider } from "./HolidayPeriodContext";
import { useHolidayClassification } from "./hooks/useHolidayClassification";
import { TeenClassDateSelector } from "./TeenClassDateSelector";
import { WorkdayDateSelector } from "./WorkdayDateSelector";
import { EmptyHolidayState } from "./EmptyHolidayState";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { toast } from "@/hooks/use-toast";

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
  
  // Récupérer les informations de la période sélectionnée
  const { data: holidayPeriod, isLoading: isLoadingPeriod, error: periodError } = useQuery({
    queryKey: ["holiday_period", periodId],
    queryFn: async () => {
      console.log("Fetching holiday period:", periodId);
      if (!periodId) {
        console.log("No period ID provided");
        return null;
      }
      
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .eq("id", periodId)
        .single();
      
      if (error) {
        console.error("Error fetching holiday period:", error);
        throw error;
      }
      
      console.log("Holiday period data:", data);
      return data;
    },
    enabled: Boolean(periodId),
    retry: 1
  });

  // Récupérer les informations de l'enfant
  const { data: childInfo, isLoading: isLoadingChild, error: childError } = useQuery({
    queryKey: ["child", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return null;
      console.log("Fetching child info for:", selectedChild);
      
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .single();
      
      if (error) {
        console.error("Error fetching child info:", error);
        throw error;
      }
      
      console.log("Child info:", data);
      return data;
    },
    enabled: Boolean(selectedChild),
    retry: 1
  });

  // Gérer les erreurs
  useEffect(() => {
    if (periodError) {
      console.error("Period fetch error:", periodError);
      toast({ 
        title: "Erreur",
        description: "Impossible de charger les informations de la période. Veuillez réessayer.",
        variant: "destructive"
      });
    }
    
    if (childError) {
      console.error("Child fetch error:", childError);
      toast({ 
        title: "Erreur",
        description: "Impossible de charger les informations de l'enfant. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  }, [periodError, childError]);

  // Import our utility hook for teen class detection
  const { isTeenClassSync } = useSchoolClassUtils();

  // Vérifier si la période est une période d'été spéciale pour les CM2
  useEffect(() => {
    if (!periodId || !childInfo || !childInfo.school_class) return;
    
    console.log("Checking if CM2 summer period for:", childInfo.school_class);
    
    if (childInfo.school_class === "CM2") {
      const checkSummerPeriod = async () => {
        try {
          const { data } = await supabase
            .from("available_holiday_periods")
            .select("name")
            .eq("id", periodId)
            .single();
          
          if (data && ["ETE-01", "ETE-02", "ETE-03", "ETE-04"].includes(data.name)) {
            console.log("Is CM2 summer period!");
            setIsCM2SummerPeriod(true);
          } else {
            console.log("Not a summer period for CM2");
            setIsCM2SummerPeriod(false);
          }
        } catch (error) {
          console.error("Error checking summer period:", error);
          setIsCM2SummerPeriod(false);
        }
      };
      
      checkSummerPeriod();
    } else {
      setIsCM2SummerPeriod(false);
    }
  }, [periodId, childInfo]);

  // Déterminer si l'enfant est un adolescent
  const isTeenClassValue = childInfo ? isTeenClassSync(childInfo.school_class, periodId) : false;

  // Effet pour réinitialiser les dates lors du changement d'enfant ou de période
  useEffect(() => {
    console.log("Child or period changed - resetting dates");
    console.log("selectedChild:", selectedChild);
    console.log("isTeenClassValue:", isTeenClassValue);
    console.log("isCM2SummerPeriod:", isCM2SummerPeriod);
    
    if (!selectedChild || !periodId) return;
    
    const shouldHandleTeenLogic = (isTeenClassValue || isCM2SummerPeriod) && holidayPeriod;
    
    if (shouldHandleTeenLogic) {
      console.log("Handling teen/CM2 summer logic");
      // Réinitialiser les dates sans présélection
      setSelectedDates([]);
    } else {
      console.log("Handling regular child logic");
      setSelectedDates([]);
    }
  }, [selectedChild, periodId, isTeenClassValue, isCM2SummerPeriod, holidayPeriod, setSelectedDates]);

  // Afficher un état de chargement
  if (isLoadingPeriod || isLoadingChild) {
    return (
      <EmptyHolidayState 
        message="Chargement en cours..."
        subtitle="Veuillez patienter pendant le chargement des données."
      />
    );
  }

  // Vérifier que les données nécessaires sont présentes
  if (!holidayPeriod || !selectedChild) {
    console.log("Missing data - holidayPeriod:", !!holidayPeriod, "selectedChild:", !!selectedChild);
    return (
      <EmptyHolidayState 
        message="Sélection requise"
        subtitle="Veuillez sélectionner une période et un enfant."
      />
    );
  }

  if (!childInfo || !childInfo.school_class) {
    console.log("Missing child school class");
    return (
      <EmptyHolidayState 
        message="Information manquante"
        subtitle="La classe de l'enfant n'est pas définie. Veuillez contacter l'administration."
      />
    );
  }

  // Déterminer si nous sommes sur une page de réservation pour adolescents
  const isTeenHolidayPage = window.location.pathname.includes("teenholiday");
  
  console.log("HolidayDateSelector - rendering with:");
  console.log("- isTeenHolidayPage:", isTeenHolidayPage);
  console.log("- isTeenClassValue:", isTeenClassValue);
  console.log("- isCM2SummerPeriod:", isCM2SummerPeriod);
  console.log("- path:", window.location.pathname);
  
  // Déterminer si nous devons afficher le sélecteur pour adolescents
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

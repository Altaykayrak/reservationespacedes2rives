
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { useEffect, useState } from "react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useLocation } from "react-router-dom";
import { HolidaySelectors } from "./holiday/HolidaySelectors";
import { DateSelectorWrapper } from "./holiday/DateSelectorWrapper";
import { HolidayDialogs } from "./holiday/HolidayDialogs";
import { ReservationButton } from "./holiday/ReservationButton";

interface HolidayReservationContentProps {
  filteredChildren?: Tables<"children">[] | null;
  filterTeenPeriods?: boolean;
  invertSelectors?: boolean;
}

export const HolidayReservationContent = ({
  filteredChildren,
  filterTeenPeriods = false,
  invertSelectors = false
}: HolidayReservationContentProps) => {
  const {
    selectedDates,
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    holidayPeriods,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateAlreadyReserved,
    setSelectedDates,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog
  } = useHolidayReservation();

  const { children: allChildren } = useChildrenData();
  const [filteredChildrenState, setFilteredChildrenState] = useState<any[]>([]);
  const { isTeenClassSync } = useSchoolClassUtils();
  const location = useLocation();
  const [isCM2SummerPeriod, setIsCM2SummerPeriod] = useState(false);
  
  // Fonction callback pour recevoir l'information de CM2 en période d'été
  const handleCM2SummerPeriodCheck = (isInSummerPeriod: boolean) => {
    console.log("CM2 en période d'été détecté:", isInSummerPeriod);
    setIsCM2SummerPeriod(isInSummerPeriod);
  };
  
  // Récupération des informations de l'enfant sélectionné
  const { data: childInfo } = useQuery({
    queryKey: ["child", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return null;
      
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild
  });

  // Récupération des informations de la période sélectionnée
  const { data: holidayPeriod } = useQuery({
    queryKey: ["holiday_period", selectedPeriod],
    queryFn: async () => {
      if (!selectedPeriod) return null;
      
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .eq("id", selectedPeriod)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPeriod
  });

  // Récupérer les mappages de classe pour la période sélectionnée
  const { data: classMappings } = useQuery({
    queryKey: ["holiday_class_mappings", selectedPeriod],
    queryFn: async () => {
      if (!selectedPeriod) return [];
      
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("school_class, category")
        .eq("holiday_period_id", selectedPeriod);
      
      if (error) {
        console.error("Erreur lors de la récupération des mappings de classe:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!selectedPeriod,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Filtrer les enfants en fonction de leur classe et de la période sélectionnée
  useEffect(() => {
    if (!allChildren || !selectedPeriod) return;
    
    console.log("Children passed to ChildSelector:", allChildren);
    
    // Récupérer les mappages de classe pour cette période
    const fetchMappings = async () => {
      if (!selectedPeriod) return;

      try {
        const { data, error } = await supabase
          .from("holiday_period_class_mappings")
          .select("school_class, category")
          .eq("holiday_period_id", selectedPeriod);

        if (error) {
          console.error("Erreur lors de la récupération des mappings:", error);
          return;
        }

        // Filtrer les enfants selon les mappages de classe
        // Pour la page holiday-reservations, on ne veut que les enfants de maternelle et primaire
        const filtered = allChildren.filter(child => {
          // Vérifier si nous avons un mapping spécifique pour cette classe
          const mapping = data.find(m => 
            m.school_class.toLowerCase() === child.school_class.toLowerCase()
          );

          if (mapping) {
            return mapping.category === 'maternelle' || mapping.category === 'primaire';
          }
          
          // Si pas de mapping, utiliser la logique par défaut
          return !isTeenClassSync(child.school_class);
        });
        
        console.log("Filtered children for regular holiday reservations:", filtered);
        setFilteredChildrenState(filtered);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchMappings();
  }, [allChildren, selectedPeriod, isTeenClassSync]);

  // Lire l'ID de période depuis l'URL lors du montage (une seule fois)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const periodId = searchParams.get("periodId");

      if (periodId && periodId !== selectedPeriod) {
        console.log("[HolidayReservationContent] Setting period from URL:", periodId);
        setSelectedPeriod(periodId);
      }
    } catch (error) {
      console.error("[HolidayReservationContent] Error reading URL:", error);
    }
  }, [location.search, selectedPeriod, setSelectedPeriod]);

  // Calculer le nombre exact de jours sélectionnés valides
  const validDates = selectedDates.filter(d => 
    d.date instanceof Date && !isNaN(d.date.getTime())
  );
  const validDatesCount = validDates.length;

  // Vérifier si le nombre de jours sélectionnés est suffisant
  const hasMinimumDays = validDatesCount >= 3;
  
  // Fonction pour éviter les doubles clics
  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier le nombre exact de dates sélectionnées
    console.log(`🔍 DEBUG: Bouton cliqué - Dates sélectionnées total: ${selectedDates.length}`);
    console.log(`🔍 DEBUG: Bouton cliqué - Nombre de dates valides: ${validDatesCount}`);
    console.log(`🔍 DEBUG: Validation minimale: ${hasMinimumDays} (${validDatesCount} >= 3)`);
    
    // Stop si le minimum n'est pas atteint
    if (validDatesCount < 3) {
      console.log("🛑 DEBUG: Moins de 3 dates valides, affichage du dialogue");
      setMinimumDaysDialog({ isOpen: true });
      return;
    }
    
    if (!isSubmitting) {
      // Vérifier que toutes les dates sont des instances valides de Date
      const validDates = selectedDates.filter(
        d => d.date instanceof Date && !isNaN(d.date.getTime())
      );
      
      if (validDates.length !== selectedDates.length) {
        console.error("⚠️ Certaines dates sont invalides:", 
          selectedDates.filter(d => !(d.date instanceof Date) || isNaN(d.date.getTime())));
      }
      
      // Vérification supplémentaire du minimum de 3 jours
      if (validDates.length < 3) {
        setMinimumDaysDialog({ isOpen: true });
        return;
      }
      
      console.log("✅ DEBUG: Dates valides avant soumission:", validDates);
      handleSubmit();
    }
  };

  const isButtonDisabled = !selectedChild || !selectedPeriod || validDatesCount < 3 || isSubmitting || isCM2SummerPeriod;

  return (
    <div className="space-y-6">
      <HolidaySelectors 
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
        holidayPeriods={holidayPeriods}
        filteredChildren={filteredChildren || filteredChildrenState}
        setSelectedDates={setSelectedDates}
        filterTeenPeriods={filterTeenPeriods}
        invertSelectors={invertSelectors}
        onCM2SummerPeriodCheck={handleCM2SummerPeriodCheck}
      />

      <DateSelectorWrapper
        selectedPeriod={selectedPeriod}
        selectedChild={selectedChild}
        childInfo={childInfo}
        holidayPeriod={holidayPeriod}
        selectedDates={selectedDates}
        handleDateToggle={handleDateToggle}
        handleOptionChange={handleOptionChange}
        isDateAlreadyReserved={isDateAlreadyReserved}
        setSelectedDates={setSelectedDates}
        isCM2SummerPeriod={isCM2SummerPeriod}
        isTeenClassSync={isTeenClassSync}
      />

      <ReservationButton
        onSubmitClick={onSubmitClick}
        isDisabled={isButtonDisabled}
        isSubmitting={isSubmitting}
      />

      <HolidayDialogs
        showSuccessDialog={showSuccessDialog}
        setShowSuccessDialog={setShowSuccessDialog}
        noSpotsDialog={noSpotsDialog}
        setNoSpotsDialog={setNoSpotsDialog}
        minimumDaysDialog={minimumDaysDialog}
        setMinimumDaysDialog={setMinimumDaysDialog}
      />
    </div>
  );
};

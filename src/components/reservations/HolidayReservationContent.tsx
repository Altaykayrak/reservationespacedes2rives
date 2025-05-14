
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { HolidayDateSelector } from "./holiday/HolidayDateSelector";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { NoSpotsDialog } from "./NoSpotsDialog";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { useEffect, useState } from "react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { HolidayPeriodProvider } from "./holiday/HolidayPeriodContext";
import { useLocation } from "react-router-dom";

interface HolidayReservationContentProps {
  filteredChildren?: Tables<"children">[] | null;
  filterTeenPeriods?: boolean;
}

export const HolidayReservationContent = ({
  filteredChildren,
  filterTeenPeriods = false
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

  // Récupérer les catégories des classes scolaires pour filtrer les enfants non-ados
  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategoriesNonTeen"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*")
        .neq("category", "adolescent");
      
      if (error) throw error;
      return data;
    },
  });

  // Filtrer les enfants en fonction de leur classe (exclure les adolescents)
  useEffect(() => {
    if (!allChildren) return;
    
    console.log("Children passed to ChildSelector:", allChildren);
    
    const filtered = allChildren.filter(child => {
      // Vérifier si c'est un enfant non-adolescent selon les catégories
      const isNonTeenByCategory = schoolClassCategories?.some(category => 
        category.name.toUpperCase() === child.school_class.toUpperCase()
      );
      
      // Alternative: utiliser la fonction isTeenClassSync pour exclure les adolescents
      const isNotTeen = !isTeenClassSync(child.school_class);
      
      return isNonTeenByCategory || isNotTeen;
    });
    
    console.log("Filtered children for regular holiday reservations:", filtered);
    setFilteredChildrenState(filtered);
  }, [allChildren, schoolClassCategories, isTeenClassSync]);

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

  // Fonction pour éviter les doubles clics
  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`DEBUG: Bouton cliqué - Nombre de dates sélectionnées: ${selectedDates.length}`);
    
    if (!isSubmitting) {
      handleSubmit();
    }
  };

  // Déterminer si l'enfant est un adolescent (pour le vérifier si besoin)
  const isTeenClass = childInfo ? isTeenClassSync(childInfo.school_class, selectedPeriod) : false;

  return (
    <div className="space-y-6">
      <ChildSelector
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
        children={filteredChildren || filteredChildrenState}
        setSelectedDates={setSelectedDates}
        onCM2SummerPeriodCheck={handleCM2SummerPeriodCheck}
      />

      <PeriodSelector
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        holidayPeriods={holidayPeriods}
        filterTeenOnly={false}
      />

      {selectedPeriod && selectedChild && childInfo && holidayPeriod && !isCM2SummerPeriod && (
        <HolidayPeriodProvider 
          holidayPeriod={holidayPeriod} 
          childInfo={childInfo} 
          isTeenClass={isTeenClass}
        >
          <HolidayDateSelector
            selectedDates={selectedDates}
            handleDateToggle={handleDateToggle}
            handleOptionChange={handleOptionChange}
            isDateAlreadyReserved={isDateAlreadyReserved}
            periodId={selectedPeriod}
            selectedChild={selectedChild}
            setSelectedDates={setSelectedDates}
          />
        </HolidayPeriodProvider>
      )}

      <div className="flex justify-end mt-6">
        <Button
          onClick={onSubmitClick}
          className="w-full md:w-auto"
          disabled={!selectedChild || !selectedPeriod || selectedDates.length === 0 || isSubmitting || isCM2SummerPeriod}
          type="button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Réservation en cours...
            </>
          ) : (
            "Confirmer réservation"
          )}
        </Button>
      </div>

      <SuccessReservationDialog 
        open={showSuccessDialog} 
        onOpenChange={setShowSuccessDialog}
      />

      <NoSpotsDialog
        open={noSpotsDialog.isOpen}
        onOpenChange={(open) => setNoSpotsDialog({ ...noSpotsDialog, isOpen: open })}
        schoolClass={noSpotsDialog.schoolClass}
        date={noSpotsDialog.date}
      />
      
      <MinimumDaysDialog
        open={minimumDaysDialog.isOpen}
        onOpenChange={(open) => setMinimumDaysDialog({ isOpen: open })}
      />
    </div>
  );
};

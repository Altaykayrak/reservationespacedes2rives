
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { TeenClassDateSelector } from "./holiday/TeenClassDateSelector";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { NoSpotsDialog } from "./NoSpotsDialog";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { useEffect, useState } from "react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { HolidayPeriodProvider } from "./holiday/HolidayPeriodContext";
import { eventBus } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

export const TeenHolidayReservationContent = () => {
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
  const [filteredChildren, setFilteredChildren] = useState<any[]>([]);
  const { isTeenClassSync } = useSchoolClassUtils();
  const [searchParams, setSearchParams] = useSearchParams();
  
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

  // Update URL when period changes without reloading page
  useEffect(() => {
    if (selectedPeriod) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set("periodId", selectedPeriod);
        return newParams;
      }, { replace: true });
    }
  }, [selectedPeriod, setSearchParams]);
  
  // Get periodId from URL on initial load
  useEffect(() => {
    const periodId = searchParams.get("periodId");
    if (periodId && !selectedPeriod) {
      setSelectedPeriod(periodId);
    }
  }, [searchParams, selectedPeriod, setSelectedPeriod]);

  // Récupérer les catégories des classes scolaires
  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*")
        .eq("category", "adolescent");
      
      if (error) throw error;
      return data;
    },
  });

  // Filtrer les enfants en fonction de leur classe
  useEffect(() => {
    if (!allChildren) return;
    
    console.log("Children passed to ChildSelector:", allChildren);
    
    const filtered = allChildren.filter(child => {
      // Vérifier si c'est un adolescent selon les catégories
      const isTeenByCategory = schoolClassCategories?.some(category => 
        category.name.toUpperCase() === child.school_class.toUpperCase()
      );
      
      // Vérifier si c'est un CM2 (ils sont autorisés en été)
      const isCM2 = child.school_class === "CM2";
      
      return isTeenByCategory || isCM2;
    });
    
    console.log("Filtered children based on page type:", filtered);
    setFilteredChildren(filtered);
  }, [allChildren, schoolClassCategories]);

  // Fonction pour éviter les doubles clics
  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`DEBUG: Bouton cliqué - Nombre de dates sélectionnées: ${selectedDates.length}`);
    
    if (!isSubmitting) {
      handleSubmit();
    }
  };

  // Déterminer si l'enfant est un adolescent
  const isTeenClass = childInfo ? isTeenClassSync(childInfo.school_class, selectedPeriod) : false;

  // Add a state to force re-renders
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Subscribe to reservation events
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('holiday-reservation-created', () => {
      console.log("TeenHolidayReservationContent: Received holiday-reservation-created event");
      // Force a re-render
      setForceUpdate(prev => prev + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          <ChildSelector
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            children={filteredChildren}
            setSelectedDates={setSelectedDates}
          />

          <PeriodSelector
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            holidayPeriods={holidayPeriods}
            filterTeenOnly={true}
          />

          {selectedPeriod && selectedChild && childInfo && holidayPeriod && (
            <HolidayPeriodProvider 
              holidayPeriod={holidayPeriod} 
              childInfo={childInfo} 
              isTeenClass={isTeenClass}
            >
              <TeenClassDateSelector
                key={`teen-selector-${forceUpdate}`}
                selectedDates={selectedDates}
                isDateAlreadyReserved={isDateAlreadyReserved}
                handleOptionChange={handleOptionChange}
                handleDateToggle={handleDateToggle}
                periodId={selectedPeriod}
              />
            </HolidayPeriodProvider>
          )}

          <Button
            onClick={onSubmitClick}
            className="w-full"
            disabled={!selectedChild || !selectedPeriod || selectedDates.length === 0 || isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Réservation en cours...
              </>
            ) : (
              "Confirmer la réservation"
            )}
          </Button>
        </div>
      </Card>

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
    </>
  );
};

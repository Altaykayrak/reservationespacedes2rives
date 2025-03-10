
import { useState, useEffect } from "react";
import { useChildrenData } from "./useChildrenData";
import { useHolidayPeriods } from "./useHolidayPeriods";
import { useReservationSubmission } from "./useReservationSubmission";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useExistingHolidayReservations } from "./useExistingHolidayReservations";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useHolidayReservation = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { children } = useChildrenData();
  const { holidayPeriods } = useHolidayPeriods();
  const { existingReservations, isDateAlreadyReserved, refetchReservations } = useExistingHolidayReservations(selectedChild);

  const { data: childInfo } = useQuery({
    queryKey: ["child", selectedChild],
    queryFn: async () => {
      if (!selectedChild) {
        console.log("Pas d'enfant sélectionné");
        return null;
      }
      console.log("Récupération des informations de l'enfant:", selectedChild);
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération des informations de l'enfant:", error);
        throw error;
      }
      console.log("Informations de l'enfant récupérées:", data);
      return data;
    },
    enabled: Boolean(selectedChild)
  });

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

  const isTeenClass = childInfo?.school_class && schoolClassCategories?.some(
    category => category.name.toUpperCase() === childInfo.school_class.toUpperCase()
  );

  const resetForm = () => {
    setSelectedDates([]);
    setSelectedPeriod("");
  };

  const { 
    handleSubmit: submit, 
    noSpotsDialog, 
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog,
    isSubmitting
  } = useReservationSubmission(
    selectedChild,
    selectedDates,
    holidayPeriods,
    isDateAlreadyReserved,
    async () => {
      await refetchReservations();
      setShowSuccessDialog(true);
      resetForm();
    },
    resetForm
  );

  // Utilisez ce wrapper pour éviter les doubles exécutions
  const handleSubmit = async () => {
    console.log("DEBUG: handleSubmit appelé depuis HolidayReservationContent");
    await submit();
  };

  const handleDateToggle = (date: Date) => {
    const isTeenPage = window.location.pathname === "/teenholiday-reservations" ||
                      window.location.pathname === "/admin/reservations/new-teen-holiday" ||
                      window.location.pathname === "/admin/new-teenholiday-reservation";
    
    if (isDateAlreadyReserved(date)) {
      return;
    }
    
    const existingDate = selectedDates.find(d => d.date.getTime() === date.getTime());
    if (existingDate) {
      setSelectedDates(selectedDates.filter(d => d.date.getTime() !== date.getTime()));
    } else {
      // Pour les adolescents, on active "Sans repas" par défaut
      const withoutMealByDefault = isTeenPage && isTeenClass;
      setSelectedDates([...selectedDates, { 
        date, 
        withoutMeal: withoutMealByDefault, 
        earlyDropoff: false 
      }]);
    }
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(selectedDates.map(d => 
      d.date.getTime() === date.getTime() 
        ? { ...d, [option]: value }
        : d
    ));
  };

  return {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    selectedPeriod,
    setSelectedPeriod,
    children,
    holidayPeriods,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateAlreadyReserved,
    isTeenClass,
    childInfo,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog
  };
};

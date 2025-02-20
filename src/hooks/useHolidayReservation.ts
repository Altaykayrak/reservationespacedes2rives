
import { useState, useEffect } from "react";
import { useChildrenData } from "./useChildrenData";
import { useHolidayPeriods } from "./useHolidayPeriods";
import { useReservationSubmission } from "./useReservationSubmission";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useExistingHolidayReservations } from "./useExistingHolidayReservations";
import { useToast } from "@/hooks/use-toast";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useHolidayReservation = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    setSelectedDates([]);
  }, [selectedChild]);

  useEffect(() => {
    const isTeenPage = window.location.pathname === "/teenholiday-reservations";
    
    if (selectedChild && isTeenClass && selectedPeriod && holidayPeriods && isTeenPage) {
      const period = holidayPeriods.find(p => p.id === selectedPeriod);
      if (period) {
        const dates: DateOption[] = [];
        const startDate = new Date(period.start_date);
        const endDate = new Date(period.end_date);
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
    }
  }, [selectedChild, isTeenClass, selectedPeriod, holidayPeriods]);

  const resetForm = () => {
    setSelectedDates([]);
    setSelectedPeriod("");
  };

  const { handleSubmit: submit } = useReservationSubmission(
    selectedChild,
    selectedDates,
    holidayPeriods,
    isDateAlreadyReserved,
    async () => {
      await refetchReservations();
      toast({
        title: "Succès",
        description: "Les réservations ont été créées avec succès.",
      });
      resetForm();
    },
    resetForm
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateToggle = (date: Date) => {
    const isTeenPage = window.location.pathname === "/teenholiday-reservations";
    
    if (isTeenClass && isTeenPage) return;
    
    if (isDateAlreadyReserved(date)) {
      return;
    }
    
    const existingDate = selectedDates.find(d => d.date.getTime() === date.getTime());
    if (existingDate) {
      setSelectedDates(selectedDates.filter(d => d.date.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, { 
        date, 
        withoutMeal: false, 
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
    isSubmitting
  };
};

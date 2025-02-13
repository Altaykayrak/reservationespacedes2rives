
import { useState, useEffect } from "react";
import { useChildrenData } from "./useChildrenData";
import { useHolidayPeriods } from "./useHolidayPeriods";
import { useExistingReservations } from "./useExistingReservations";
import { useReservationSubmission } from "./useReservationSubmission";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useHolidayReservation = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  const { children } = useChildrenData();
  const { holidayPeriods } = useHolidayPeriods();
  const { isDateAlreadyReserved, refetchReservations } = useExistingReservations(selectedChild);

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
    enabled: Boolean(selectedChild),
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

  // Effet pour réinitialiser les dates lors du changement d'enfant
  useEffect(() => {
    setSelectedDates([]);
  }, [selectedChild]);

  // Effet pour présélectionner les dates pour les adolescents
  useEffect(() => {
    if (selectedChild && isTeenClass && selectedPeriod && holidayPeriods) {
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

  const { handleSubmit: submitReservation } = useReservationSubmission(
    selectedChild,
    selectedDates,
    holidayPeriods,
    isDateAlreadyReserved,
    refetchReservations,
    resetForm
  );

  const handleDateToggle = (date: Date) => {
    if (isTeenClass) return; // Empêcher la modification manuelle pour les adolescents
    
    const existingDate = selectedDates.find(d => d.date.getTime() === date.getTime());
    if (existingDate) {
      setSelectedDates(selectedDates.filter(d => d.date.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, { date, withoutMeal: false, earlyDropoff: false }]);
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
    handleSubmit: submitReservation,
    isDateAlreadyReserved,
    isTeenClass
  };
};

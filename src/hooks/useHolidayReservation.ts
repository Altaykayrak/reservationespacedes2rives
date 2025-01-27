import { useState } from "react";
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
    }
  });

  const isTeenClass = childInfo?.school_class && schoolClassCategories?.some(
    category => category.name.toUpperCase() === childInfo.school_class.toUpperCase()
  );

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

  const handleSubmit = async () => {
    if (isTeenClass && selectedPeriod) {
      const selectedHolidayPeriod = holidayPeriods?.find(period => period.id === selectedPeriod);
      if (selectedHolidayPeriod) {
        const dates: DateOption[] = [];
        const startDate = new Date(selectedHolidayPeriod.start_date);
        const endDate = new Date(selectedHolidayPeriod.end_date);
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
    await submitReservation();
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
    isTeenClass
  };
};
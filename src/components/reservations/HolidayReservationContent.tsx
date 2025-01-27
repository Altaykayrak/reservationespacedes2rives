import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { HolidayDateSelector } from "./HolidayDateSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays } from "lucide-react";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const HolidayReservationContent = () => {
  const {
    selectedDates,
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    children,
    holidayPeriods,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateAlreadyReserved,
    setSelectedDates
  } = useHolidayReservation();

  // Fetch child information to check if they're in a teen class
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

  // Fetch school class categories to identify teen classes
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

  const handleConfirmation = async () => {
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
    await handleSubmit();
  };

  if (!holidayPeriods || holidayPeriods.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">
          Aucune période de vacances n'est disponible pour le moment.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <ChildSelector
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          children={children}
        />

        <PeriodSelector
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          holidayPeriods={holidayPeriods}
        />

        {selectedPeriod && (
          <HolidayDateSelector
            selectedDates={selectedDates}
            handleDateToggle={handleDateToggle}
            handleOptionChange={handleOptionChange}
            isDateAlreadyReserved={isDateAlreadyReserved}
            periodId={selectedPeriod}
            selectedChild={selectedChild}
          />
        )}

        <Button
          onClick={handleConfirmation}
          className="w-full"
          disabled={!selectedChild || !selectedPeriod}
        >
          Confirmer la réservation
        </Button>
      </div>
    </Card>
  );
};
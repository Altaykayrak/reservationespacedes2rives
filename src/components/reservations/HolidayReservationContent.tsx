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
    isDateAlreadyReserved
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

  if (!holidayPeriods || holidayPeriods.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Réservations vacances</h2>
            </div>
            <p className="text-center text-gray-500">
              Aucune période de vacances n'est disponible pour le moment.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Réservations vacances</h2>
          </div>
          
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
              onClick={handleSubmit}
              className="w-full"
              disabled={!selectedChild || !selectedPeriod || (!isTeenClass && selectedDates.length === 0)}
            >
              Confirmer la réservation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
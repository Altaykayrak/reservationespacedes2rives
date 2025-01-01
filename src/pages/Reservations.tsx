import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, isWednesday, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type ClosedPeriod = Tables<"closed_periods">;

const Reservations = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Fetch closed periods
  const { data: closedPeriods } = useQuery({
    queryKey: ["closedPeriods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closed_periods")
        .select("*");
      
      if (error) throw error;
      return data as ClosedPeriod[];
    },
  });

  // Helper function to check if a date is within a closed period
  const isDateClosed = (date: Date) => {
    if (!closedPeriods) return false;
    return closedPeriods.some(period => {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  // Helper function to check if a date is during school holidays
  // This is a simplified example - you might want to add actual holiday dates
  const isSchoolHoliday = (date: Date) => {
    // Example school holiday periods - replace with actual dates
    const holidays = [
      { start: new Date(2024, 3, 6), end: new Date(2024, 3, 22) }, // Spring holidays
      { start: new Date(2024, 6, 6), end: new Date(2024, 7, 31) }, // Summer holidays
    ];

    return holidays.some(period => 
      date >= period.start && date <= period.end
    );
  };

  // Custom day rendering
  const renderDay = (day: Date) => {
    const isHoliday = isSchoolHoliday(day);
    const isClosed = isDateClosed(day);
    const isWed = isWednesday(day);

    return (
      <div
        className={`relative w-full h-full p-2 ${
          isClosed
            ? "bg-red-100"
            : isHoliday
            ? "bg-orange-100"
            : isWed
            ? "bg-blue-100"
            : ""
        }`}
      >
        <span className="absolute top-1 left-1">
          {format(day, "d")}
        </span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Réservations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={setSelectedDates}
            locale={fr}
            modifiersStyles={{
              selected: {
                backgroundColor: "rgb(59 130 246)",
                color: "white",
              },
            }}
            components={{
              Day: ({ date }) => renderDay(date),
            }}
          />

          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">Légende :</h3>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100"></div>
              <span>Mercredi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100"></div>
              <span>Vacances scolaires</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100"></div>
              <span>Jours fermés</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Détails de la réservation</h2>
          {selectedDates.length > 0 ? (
            <div className="space-y-4">
              <p>Dates sélectionnées :</p>
              <ul className="list-disc pl-5">
                {selectedDates.map((date) => (
                  <li key={date.toISOString()}>
                    {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                  </li>
                ))}
              </ul>
              {/* Form for reservation details will be added in the next step */}
            </div>
          ) : (
            <p className="text-gray-500">
              Veuillez sélectionner une ou plusieurs dates dans le calendrier
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
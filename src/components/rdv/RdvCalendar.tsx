
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Rdv } from "@/types/rdv";
import { fr } from "date-fns/locale";
import { format, isWithinInterval } from "date-fns";
import { useMemo } from "react";

interface RdvCalendarProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  rdvList: Rdv[];
  summerRange: {
    start: Date;
    end: Date;
  };
}

export const RdvCalendar = ({
  selectedDate,
  setSelectedDate,
  rdvList,
  summerRange
}: RdvCalendarProps) => {
  // Use useMemo to create a set of dates with slots
  const datesWithSlots = useMemo(() => {
    const dateSet = new Set<string>();
    rdvList.forEach(slot => {
      dateSet.add(slot.date);
    });
    console.log("Dates with slots:", [...dateSet]);
    return dateSet;
  }, [rdvList]);

  // Set default month to July 2025
  const defaultMonth = useMemo(() => {
    return new Date(2025, 6, 1); // July 2025 (month 6 in JS)
  }, []);

  // Check if a date has slots
  const isDayWithSlots = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return datesWithSlots.has(formattedDate);
  };
  
  console.log("RdvCalendar - rdvList length:", rdvList.length);
  console.log("RdvCalendar - Summer range:", summerRange);
  console.log("RdvCalendar - Default month:", defaultMonth);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Calendrier - Juin/Juillet/Août 2025</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={fr}
          className="mx-auto scale-95 transform origin-top-left pointer-events-auto"
          defaultMonth={defaultMonth}
          disabled={(date) => {
            // Convert to midnight UTC to avoid timezone issues
            const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const rangeStart = new Date(summerRange.start.getFullYear(), summerRange.start.getMonth(), summerRange.start.getDate());
            const rangeEnd = new Date(summerRange.end.getFullYear(), summerRange.end.getMonth(), summerRange.end.getDate());

            // Check if the date is outside range or doesn't have slots
            const isInRange = isWithinInterval(dateToCheck, {
              start: rangeStart,
              end: rangeEnd
            });
            const hasSlots = isDayWithSlots(dateToCheck);

            // For debugging specific dates
            if (dateToCheck.getDate() === 1 && dateToCheck.getMonth() === 6) {
              // July 1st for debugging
              console.log("July 1 evaluation:", {
                date: dateToCheck,
                isInRange,
                hasSlots,
                rangeStart,
                rangeEnd
              });
            }

            // Return true to disable dates outside range or without slots
            return !isInRange || !hasSlots;
          }}
          modifiers={{
            hasSlots: (date) => isDayWithSlots(date)
          }}
          modifiersClassNames={{
            hasSlots: "bg-green-50 font-medium"
          }}
        />
        
        <div className="mt-2 text-center text-xs text-gray-500">
          Les dates avec des créneaux disponibles sont en surbrillance
        </div>
      </CardContent>
    </Card>
  );
};

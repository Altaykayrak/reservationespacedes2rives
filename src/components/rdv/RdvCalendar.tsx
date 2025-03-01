
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Rdv } from "@/types/rdv";
import { fr } from "date-fns/locale";
import { format, isWithinInterval } from "date-fns";

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
  const isDayWithSlots = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return rdvList.some(slot => slot.date === formattedDate);
  };

  console.log("RdvCalendar - rdvList length:", rdvList.length);
  console.log("RdvCalendar - Summer range:", summerRange);
  
  // Debug available dates
  const availableDates = [];
  for (let d = new Date(summerRange.start); d <= summerRange.end; d.setDate(d.getDate() + 1)) {
    if (isDayWithSlots(new Date(d))) {
      availableDates.push(format(new Date(d), 'yyyy-MM-dd'));
    }
  }
  console.log("RdvCalendar - Available dates:", availableDates);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Calendrier - Juillet/Août 2025</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={fr}
          className="mx-auto scale-95 transform origin-top-left"
          defaultMonth={new Date(2025, 6, 1)}
          disabled={(date) => 
            !isWithinInterval(date, { 
              start: new Date(summerRange.start), 
              end: new Date(summerRange.end) 
            }) || 
            !isDayWithSlots(date)
          }
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

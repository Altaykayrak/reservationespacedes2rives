
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendrier - Juillet/Août 2025</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={fr}
          className="mx-auto"
          defaultMonth={new Date(2025, 6, 1)}
          disabled={(date) => 
            !isWithinInterval(date, summerRange) || 
            !isDayWithSlots(date)
          }
          modifiers={{
            hasSlots: (date) => isDayWithSlots(date)
          }}
          modifiersClassNames={{
            hasSlots: "bg-green-50 font-medium"
          }}
        />
        
        <div className="mt-4 text-center text-sm text-gray-500">
          Les dates avec des créneaux disponibles sont en surbrillance
        </div>
      </CardContent>
    </Card>
  );
};

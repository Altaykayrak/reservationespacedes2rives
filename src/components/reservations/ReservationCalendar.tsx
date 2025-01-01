import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAvailableDates } from "@/hooks/useAvailableDates";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReservationCalendarProps {
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
}

export const ReservationCalendar = ({
  selectedDates,
  setSelectedDates,
}: ReservationCalendarProps) => {
  const { availableWednesdays } = useAvailableDates();

  const handleDateToggle = (date: Date) => {
    if (selectedDates.some(d => d.getTime() === date.getTime())) {
      setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Mercredis disponibles</h2>
      <div className="space-y-4">
        {availableWednesdays?.map((wednesday) => {
          const date = new Date(wednesday.date);
          const isSelected = selectedDates.some(
            (d) => d.getTime() === date.getTime()
          );

          return (
            <div key={wednesday.date} className="flex items-start gap-2">
              <Checkbox
                id={wednesday.date}
                checked={isSelected}
                onCheckedChange={() => handleDateToggle(date)}
              />
              <Label htmlFor={wednesday.date} className="font-medium">
                {format(date, "EEEE d MMMM yyyy", { locale: fr })}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
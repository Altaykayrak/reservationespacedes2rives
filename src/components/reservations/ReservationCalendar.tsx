import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAvailableDates } from "@/hooks/useAvailableDates";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import { useReservations } from "@/hooks/useReservations";

interface ReservationCalendarProps {
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
}

export const ReservationCalendar = ({
  selectedDates,
  setSelectedDates,
}: ReservationCalendarProps) => {
  const { availableWednesdays } = useAvailableDates();
  const { selectedChild, isDateReservedForChild } = useReservations();

  // Filter out past dates and sort chronologically
  const sortedWednesdays = availableWednesdays
    ?.filter(wednesday => {
      const wednesdayDate = new Date(wednesday.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      return wednesdayDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleDateToggle = (date: Date) => {
    const isSelected = selectedDates.some(d => d.getTime() === date.getTime());
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  if (!sortedWednesdays || sortedWednesdays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Calendar className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="font-semibold">Aucun mercredi disponible</h3>
          <p className="text-sm text-muted-foreground">
            Il n'y a pas de mercredis disponibles pour le moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {sortedWednesdays.map((wednesday) => {
          const date = new Date(wednesday.date);
          const isSelected = selectedDates.some(
            (d) => d.getTime() === date.getTime()
          );
          const isReserved = selectedChild && isDateReservedForChild(selectedChild, date);

          return (
            <div
              key={wednesday.date}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isReserved ? 'opacity-50 bg-gray-100' : 'hover:bg-secondary/50'
              }`}
            >
              <Checkbox
                id={wednesday.date}
                checked={isSelected}
                onCheckedChange={() => !isReserved && handleDateToggle(date)}
                disabled={isReserved}
              />
              <Label
                htmlFor={wednesday.date}
                className={`flex-1 cursor-pointer font-medium ${
                  isReserved ? 'text-gray-500' : ''
                }`}
              >
                {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                {isReserved && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Déjà réservé)
                  </span>
                )}
              </Label>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
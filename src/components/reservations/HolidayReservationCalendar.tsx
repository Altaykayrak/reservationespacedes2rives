import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAvailableDates } from "@/hooks/useAvailableDates";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface HolidayReservationCalendarProps {
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
}

export const HolidayReservationCalendar = ({
  selectedDates,
  setSelectedDates,
}: HolidayReservationCalendarProps) => {
  const { availableHolidays } = useAvailableDates();

  const handleDateToggle = (date: Date) => {
    if (selectedDates.some(d => d.getTime() === date.getTime())) {
      setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  if (!availableHolidays || availableHolidays.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Périodes de vacances disponibles</h2>
        <p className="text-gray-500">Aucune période de vacances n'est disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Périodes de vacances disponibles</h2>
      <div className="space-y-4">
        {availableHolidays.map((holiday) => {
          const startDate = new Date(holiday.start_date);
          const endDate = new Date(holiday.end_date);
          const isSelected = selectedDates.some(
            (d) => d.getTime() >= startDate.getTime() && d.getTime() <= endDate.getTime()
          );

          return (
            <div key={holiday.id} className="flex items-start gap-2">
              <Checkbox
                id={holiday.id}
                checked={isSelected}
                onCheckedChange={() => {
                  // Generate array of dates between start and end date
                  const dates = [];
                  const currentDate = new Date(startDate);
                  while (currentDate <= endDate) {
                    dates.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                  }
                  if (isSelected) {
                    setSelectedDates(selectedDates.filter(d => 
                      d.getTime() < startDate.getTime() || d.getTime() > endDate.getTime()
                    ));
                  } else {
                    setSelectedDates([...selectedDates, ...dates]);
                  }
                }}
              />
              <Label htmlFor={holiday.id} className="font-medium">
                Du {format(startDate, "d MMMM yyyy", { locale: fr })} au{" "}
                {format(endDate, "d MMMM yyyy", { locale: fr })}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
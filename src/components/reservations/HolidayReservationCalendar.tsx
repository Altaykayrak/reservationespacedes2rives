import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAvailableDates } from "@/hooks/useAvailableDates";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getWeeksFromDates } from "@/utils/dateUtils";

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
      <p className="text-sm text-gray-600 mb-4">
        Vous devez réserver au moins 3 jours par semaine pendant les vacances.
      </p>
      <div className="space-y-4">
        {availableHolidays.map((holiday) => {
          const startDate = new Date(holiday.start_date);
          const endDate = new Date(holiday.end_date);

          // Generate array of dates between start and end date, excluding weekends
          const dates = [];
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            // Only add weekdays (0 = Sunday, 6 = Saturday)
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
              dates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }

          // Group selected dates by week for this holiday period
          const selectedDatesInPeriod = selectedDates.filter(
            d => d.getTime() >= startDate.getTime() && d.getTime() <= endDate.getTime()
          );
          const weekGroups = getWeeksFromDates(selectedDatesInPeriod);

          return (
            <div key={holiday.id} className="space-y-2">
              <div>
                <Label className="font-medium block mb-2">
                  Du {format(startDate, "d MMMM yyyy", { locale: fr })} au{" "}
                  {format(endDate, "d MMMM yyyy", { locale: fr })}
                </Label>
                <div className="pl-4 space-y-2">
                  {dates.map((date) => (
                    <div key={date.toISOString()} className="flex items-center space-x-2">
                      <Checkbox
                        id={date.toISOString()}
                        checked={selectedDates.some(d => d.getTime() === date.getTime())}
                        onCheckedChange={() => handleDateToggle(date)}
                      />
                      <Label htmlFor={date.toISOString()}>
                        {format(date, "EEEE d MMMM", { locale: fr })}
                      </Label>
                    </div>
                  ))}
                </div>
                {weekGroups.map((weekDates, index) => (
                  <p key={index} className="text-sm text-gray-600 mt-2">
                    Semaine {index + 1}: {weekDates.length} jour{weekDates.length > 1 ? 's' : ''} sélectionné{weekDates.length > 1 ? 's' : ''}
                    {weekDates.length < 3 && (
                      <span className="text-red-500 ml-2">
                        (minimum 3 jours requis)
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
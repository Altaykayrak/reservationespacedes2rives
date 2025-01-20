import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAvailableDates } from "@/hooks/useAvailableDates";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getWeeksFromDates } from "@/utils/dateUtils";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface HolidayReservationCalendarProps {
  selectedDates: DateOption[];
  setSelectedDates: (dates: DateOption[]) => void;
}

const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const HolidayReservationCalendar = ({
  selectedDates,
  setSelectedDates,
}: HolidayReservationCalendarProps) => {
  const { availableHolidays } = useAvailableDates();

  const handleDateToggle = (date: Date) => {
    const existingDate = selectedDates.find(d => d.date.getTime() === date.getTime());
    if (existingDate) {
      setSelectedDates(selectedDates.filter(d => d.date.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, { date, withoutMeal: false, earlyDropoff: false }]);
    }
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(selectedDates.map(d => 
      d.date.getTime() === date.getTime() 
        ? { ...d, [option]: value }
        : d
    ));
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
        Vous devez réserver au moins 3 jours ouvrables par semaine pendant les vacances.
      </p>
      <div className="space-y-6">
        {availableHolidays.map((holiday) => {
          const startDate = new Date(holiday.start_date);
          const endDate = new Date(holiday.end_date);

          // Generate array of dates between start and end date, excluding weekends
          const dates = [];
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            if (!isWeekend(currentDate)) {
              dates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }

          // Group selected dates by week for this holiday period
          const selectedDatesInPeriod = selectedDates.map(d => d.date).filter(
            d => d.getTime() >= startDate.getTime() && d.getTime() <= endDate.getTime()
          );
          const weekGroups = getWeeksFromDates(selectedDatesInPeriod);

          return (
            <div 
              key={holiday.id} 
              className="border-2 border-blue-100 rounded-lg p-4 bg-blue-50/30 shadow-sm"
            >
              <div>
                <Label className="font-medium block mb-4 text-sm text-gray-600">
                  Du {format(startDate, "d MMMM yyyy", { locale: fr })} au{" "}
                  {format(endDate, "d MMMM yyyy", { locale: fr })}
                </Label>
                <div className="pl-4 space-y-4 bg-white rounded-lg p-4">
                  {dates.map((date) => {
                    const selectedDate = selectedDates.find(d => d.date.getTime() === date.getTime());
                    return (
                      <div key={date.toISOString()} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={date.toISOString()}
                            checked={!!selectedDate}
                            onCheckedChange={() => handleDateToggle(date)}
                          />
                          <Label htmlFor={date.toISOString()}>
                            {format(date, "EEEE d MMMM", { locale: fr })}
                          </Label>
                        </div>
                        {selectedDate && (
                          <div className="ml-6 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`without-meal-${date.toISOString()}`}
                                checked={selectedDate.withoutMeal}
                                onCheckedChange={(checked) =>
                                  handleOptionChange(date, 'withoutMeal', checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`without-meal-${date.toISOString()}`}
                                className="text-sm text-gray-600"
                              >
                                Sans repas
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`early-dropoff-${date.toISOString()}`}
                                checked={selectedDate.earlyDropoff}
                                onCheckedChange={(checked) =>
                                  handleOptionChange(date, 'earlyDropoff', checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`early-dropoff-${date.toISOString()}`}
                                className="text-sm text-gray-600"
                              >
                                Accueil avant 8h30
                              </Label>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
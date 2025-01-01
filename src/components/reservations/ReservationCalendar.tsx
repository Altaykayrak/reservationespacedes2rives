import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale";
import { format, isWednesday } from "date-fns";
import { useAvailableDates } from "@/hooks/useAvailableDates";

interface ReservationCalendarProps {
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
}

export const ReservationCalendar = ({
  selectedDates,
  setSelectedDates,
}: ReservationCalendarProps) => {
  const { availableWednesdays } = useAvailableDates();

  // Helper function to check if a date is during school holidays
  const isSchoolHoliday = (date: Date) => {
    const holidays = [
      { start: new Date(2024, 3, 6), end: new Date(2024, 3, 22) },
      { start: new Date(2024, 6, 6), end: new Date(2024, 7, 31) },
    ];

    return holidays.some(period => 
      date >= period.start && date <= period.end
    );
  };

  // Helper function to check if a date is an available Wednesday
  const isAvailableWednesday = (date: Date) => {
    if (!availableWednesdays) return false;
    const dateString = format(date, 'yyyy-MM-dd');
    return availableWednesdays.some(wednesday => wednesday.date === dateString);
  };

  // Custom day rendering
  const renderDay = (day: Date) => {
    const isHoliday = isSchoolHoliday(day);
    const isWed = isWednesday(day);
    const isAvailable = isAvailableWednesday(day);

    return (
      <div
        className={`relative w-full h-full p-2 ${
          isHoliday
            ? "bg-orange-100"
            : isWed && isAvailable
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

  // Disable dates that are not available Wednesdays
  const disabledDays = (date: Date) => {
    if (!isWednesday(date)) return true;
    return !isAvailableWednesday(date);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={setSelectedDates}
        locale={fr}
        disabled={disabledDays}
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
          <span>Mercredi disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100"></div>
          <span>Vacances scolaires</span>
        </div>
      </div>
    </div>
  );
};
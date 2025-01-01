import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale";
import { format, isWednesday } from "date-fns";

interface ReservationCalendarProps {
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
}

export const ReservationCalendar = ({
  selectedDates,
  setSelectedDates,
}: ReservationCalendarProps) => {
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

  // Custom day rendering
  const renderDay = (day: Date) => {
    const isHoliday = isSchoolHoliday(day);
    const isWed = isWednesday(day);

    return (
      <div
        className={`relative w-full h-full p-2 ${
          isHoliday
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
      </div>
    </div>
  );
};
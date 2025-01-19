import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { fr } from "date-fns/locale";

interface HolidayDatePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
}

const HolidayDatePicker = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: HolidayDatePickerProps) => {
  return (
    <>
      <div>
        <Label>Date de début</Label>
        <Calendar
          mode="single"
          selected={startDate}
          onSelect={setStartDate}
          locale={fr}
        />
      </div>

      <div>
        <Label>Date de fin</Label>
        <Calendar
          mode="single"
          selected={endDate}
          onSelect={setEndDate}
          locale={fr}
        />
      </div>
    </>
  );
};

export default HolidayDatePicker;
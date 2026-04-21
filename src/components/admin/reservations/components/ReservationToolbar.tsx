
import { ReservationFilters } from "../ReservationFilters";
import { ExportButtons } from "../ExportButtons";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

interface ReservationToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  selectedClass: string;
  setSelectedClass: (schoolClass: string) => void;
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  wednesdayReservations: WednesdayReservationWithChild[] | null;
  holidayReservations: HolidayReservationWithChild[] | null;
}

export const ReservationToolbar = ({
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedClass,
  setSelectedClass,
  selectedGroup,
  setSelectedGroup,
  wednesdayReservations,
  holidayReservations,
}: ReservationToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <ReservationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
      />
      <ExportButtons
        wednesdayReservations={wednesdayReservations}
        holidayReservations={holidayReservations}
        startDate={startDate}
        endDate={endDate}
        selectedGroup={selectedGroup}
      />
    </div>
  );
};

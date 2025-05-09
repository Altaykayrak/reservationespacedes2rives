
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReservationList } from "../ReservationList";
import { HolidayPeriodFilter } from "./HolidayPeriodFilter";
import { HolidayReservationWithChild } from "@/types/reservations";

interface HolidayPeriod {
  id: string;
  name: string;
}

interface HolidayTabContentProps {
  reservations: HolidayReservationWithChild[] | null;
  onEdit: (reservation: HolidayReservationWithChild) => void;
  onDelete: (data: { id: string, type: 'wednesday' | 'holiday' }) => void;
  selectedReservations: string[];
  onSelectionChange: (id: string, isSelected: boolean) => void;
  selectedPeriod: string;
  setSelectedPeriod: (periodId: string) => void;
  availablePeriods: HolidayPeriod[];
}

export const HolidayTabContent = ({
  reservations,
  onEdit,
  onDelete,
  selectedReservations,
  onSelectionChange,
  selectedPeriod,
  setSelectedPeriod,
  availablePeriods,
}: HolidayTabContentProps) => {
  return (
    <>
      <HolidayPeriodFilter
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        availablePeriods={availablePeriods}
      />
      <ScrollArea className="h-[600px] pr-4">
        <ReservationList
          reservations={reservations}
          onEdit={onEdit}
          onDelete={onDelete}
          selectedReservations={selectedReservations}
          onSelectionChange={onSelectionChange}
        />
      </ScrollArea>
    </>
  );
};

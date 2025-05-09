
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReservationList } from "../ReservationList";
import { WednesdayReservationWithChild } from "@/types/reservations";

interface WednesdayTabContentProps {
  reservations: WednesdayReservationWithChild[] | null;
  onEdit: (reservation: WednesdayReservationWithChild) => void;
  onDelete: (data: { id: string, type: 'wednesday' | 'holiday' }) => void;
  selectedReservations: string[];
  onSelectionChange: (id: string, isSelected: boolean) => void;
}

export const WednesdayTabContent = ({
  reservations,
  onEdit,
  onDelete,
  selectedReservations,
  onSelectionChange,
}: WednesdayTabContentProps) => {
  return (
    <ScrollArea className="h-[600px] pr-4">
      <ReservationList
        reservations={reservations}
        onEdit={onEdit}
        onDelete={onDelete}
        selectedReservations={selectedReservations}
        onSelectionChange={onSelectionChange}
      />
    </ScrollArea>
  );
};

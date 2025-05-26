
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReservationList } from "../ReservationList";
import { PaginationControls } from "./PaginationControls";
import { WednesdayReservationWithChild } from "@/types/reservations";

interface WednesdayTabContentProps {
  reservations: WednesdayReservationWithChild[] | null;
  onEdit: (reservation: WednesdayReservationWithChild) => void;
  onDelete: (data: { id: string, type: 'wednesday' | 'holiday' }) => void;
  selectedReservations: string[];
  onSelectionChange: (id: string, isSelected: boolean) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    paginatedData: WednesdayReservationWithChild[];
    goToPage: (page: number) => void;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    setItemsPerPage: (items: number) => void;
    startIndex: number;
    endIndex: number;
    totalItems: number;
  };
}

export const WednesdayTabContent = ({
  reservations,
  onEdit,
  onDelete,
  selectedReservations,
  onSelectionChange,
  pagination,
}: WednesdayTabContentProps) => {
  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px] pr-4">
        <ReservationList
          reservations={pagination.paginatedData}
          onEdit={onEdit}
          onDelete={onDelete}
          selectedReservations={selectedReservations}
          onSelectionChange={onSelectionChange}
        />
      </ScrollArea>
      
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={pagination.goToPage}
        onNextPage={pagination.goToNextPage}
        onPreviousPage={pagination.goToPreviousPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
      />
    </div>
  );
};

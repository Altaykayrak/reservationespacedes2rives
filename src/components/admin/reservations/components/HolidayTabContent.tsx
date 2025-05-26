
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReservationList } from "../ReservationList";
import { HolidayPeriodFilter } from "./HolidayPeriodFilter";
import { PaginationControls } from "./PaginationControls";
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
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    paginatedData: HolidayReservationWithChild[];
    goToPage: (page: number) => void;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    setItemsPerPage: (items: number) => void;
    startIndex: number;
    endIndex: number;
    totalItems: number;
  };
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
  pagination,
}: HolidayTabContentProps) => {
  return (
    <div className="space-y-4">
      <HolidayPeriodFilter
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        availablePeriods={availablePeriods}
      />
      
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

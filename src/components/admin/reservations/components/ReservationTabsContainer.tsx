
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WednesdayTabContent } from "./WednesdayTabContent";
import { HolidayTabContent } from "./HolidayTabContent";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

interface ReservationTabsContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wednesdayReservations: WednesdayReservationWithChild[] | null;
  holidayReservations: HolidayReservationWithChild[] | null;
  onEdit: (reservation: any) => void;
  onDelete: (data: { id: string, type: 'wednesday' | 'holiday' }) => void;
  selectedReservations: string[];
  onSelectionChange: (id: string, isSelected: boolean) => void;
  selectedPeriod: string;
  setSelectedPeriod: (periodId: string) => void;
  availablePeriods: { id: string; name: string }[];
  wednesdayPagination: any;
  holidayPagination: any;
}

export const ReservationTabsContainer = ({
  activeTab,
  setActiveTab,
  wednesdayReservations,
  holidayReservations,
  onEdit,
  onDelete,
  selectedReservations,
  onSelectionChange,
  selectedPeriod,
  setSelectedPeriod,
  availablePeriods,
  wednesdayPagination,
  holidayPagination,
}: ReservationTabsContainerProps) => {
  return (
    <Tabs defaultValue="wednesday" className="w-full" onValueChange={(value) => {
      setActiveTab(value);
    }}>
      <TabsList className="mb-4">
        <TabsTrigger value="wednesday">
          Mercredis ({wednesdayPagination.totalItems})
        </TabsTrigger>
        <TabsTrigger value="holiday">
          Vacances ({holidayPagination.totalItems})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="wednesday">
        <WednesdayTabContent
          reservations={wednesdayReservations}
          onEdit={onEdit}
          onDelete={onDelete}
          selectedReservations={selectedReservations}
          onSelectionChange={onSelectionChange}
          pagination={wednesdayPagination}
        />
      </TabsContent>

      <TabsContent value="holiday">
        <HolidayTabContent
          reservations={holidayReservations}
          onEdit={onEdit}
          onDelete={onDelete}
          selectedReservations={selectedReservations}
          onSelectionChange={onSelectionChange}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          availablePeriods={availablePeriods}
          pagination={holidayPagination}
        />
      </TabsContent>
    </Tabs>
  );
};

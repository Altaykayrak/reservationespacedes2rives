
import { ReservationList } from "./ReservationList";
import { ReservationFilters } from "./ReservationFilters";
import { EditReservationDialog } from "./EditReservationDialog";
import { DeleteReservationDialog } from "./DeleteReservationDialog";
import { useFilteredReservations } from "./hooks/useFilteredReservations";
import { useReservationActions } from "./ReservationActions";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminReservationsContentProps {
  wednesdayReservations: WednesdayReservationWithChild[] | null;
  holidayReservations: HolidayReservationWithChild[] | null;
  isLoading: boolean;
  refetchReservations: () => Promise<unknown>;
}

export const AdminReservationsContent = ({
  wednesdayReservations,
  holidayReservations,
  isLoading,
  refetchReservations
}: AdminReservationsContentProps) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    selectedClass,
    setSelectedClass,
    selectedGroup,
    setSelectedGroup,
    filteredWednesdayReservations,
    filteredHolidayReservations
  } = useFilteredReservations(wednesdayReservations, holidayReservations);

  const {
    reservationToDelete,
    setReservationToDelete,
    editingReservation,
    setEditingReservation,
    isSubmitting,
    handleDelete,
    handleUpdate
  } = useReservationActions({ refetchReservations });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>

      <Tabs defaultValue="wednesday" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wednesday">Mercredis</TabsTrigger>
          <TabsTrigger value="holiday">Vacances</TabsTrigger>
        </TabsList>

        <ReservationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
        />

        <TabsContent value="wednesday">
          <div className="my-4 text-sm text-gray-600">
            {filteredWednesdayReservations ? (
              <p>Total des réservations affichées : <span className="font-semibold">{filteredWednesdayReservations.length}</span></p>
            ) : null}
          </div>

          {isLoading ? (
            <div>Chargement des réservations...</div>
          ) : (
            <ReservationList
              reservations={filteredWednesdayReservations}
              onEdit={setEditingReservation}
              onDelete={setReservationToDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="holiday">
          <div className="my-4 text-sm text-gray-600">
            {filteredHolidayReservations ? (
              <p>Total des réservations affichées : <span className="font-semibold">{filteredHolidayReservations.length}</span></p>
            ) : null}
          </div>

          {isLoading ? (
            <div>Chargement des réservations...</div>
          ) : (
            <ReservationList
              reservations={filteredHolidayReservations}
              onEdit={setEditingReservation}
              onDelete={setReservationToDelete}
            />
          )}
        </TabsContent>
      </Tabs>

      <EditReservationDialog
        reservation={editingReservation}
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        onUpdate={handleUpdate}
        isSubmitting={isSubmitting}
        withoutMeal={editingReservation?.without_meal || false}
        earlyDropoff={editingReservation?.early_dropoff || false}
        onWithoutMealChange={(checked) => 
          setEditingReservation(prev => 
            prev ? { ...prev, without_meal: checked } : null
          )
        }
        onEarlyDropoffChange={(checked) => 
          setEditingReservation(prev => 
            prev ? { ...prev, early_dropoff: checked } : null
          )
        }
      />

      <DeleteReservationDialog
        isOpen={!!reservationToDelete}
        onClose={() => setReservationToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

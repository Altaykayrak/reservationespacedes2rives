
import { ReservationList } from "./ReservationList";
import { ReservationFilters } from "./ReservationFilters";
import { EditReservationDialog } from "./EditReservationDialog";
import { DeleteReservationDialog } from "./DeleteReservationDialog";
import { useFilteredReservations } from "./hooks/useFilteredReservations";
import { useReservationActions } from "./ReservationActions";
import { ReservationWithChild } from "./hooks/useAdminReservations";

interface AdminReservationsContentProps {
  reservations: ReservationWithChild[] | undefined;
  isLoading: boolean;
  refetchReservations: () => Promise<unknown>;
}

export const AdminReservationsContent = ({
  reservations,
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
    filteredReservations
  } = useFilteredReservations(reservations);

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

      {isLoading ? (
        <div>Chargement des réservations...</div>
      ) : (
        <ReservationList
          reservations={filteredReservations}
          onEdit={setEditingReservation}
          onDelete={setReservationToDelete}
        />
      )}

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

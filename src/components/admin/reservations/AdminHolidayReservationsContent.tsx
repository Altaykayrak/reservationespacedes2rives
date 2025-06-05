
import { useQueryClient } from "@tanstack/react-query";
import { EditReservationDialog } from "./EditReservationDialog";
import { DeleteReservationDialog } from "./DeleteReservationDialog";
import { useState } from "react";
import { useReservationActions } from "./ReservationActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";
import { HolidayReservationWithChild } from "@/types/reservations";
import { useFilteredHolidayReservations } from "./hooks/useFilteredHolidayReservations";
import { ReservationToolbar } from "./components/ReservationToolbar";
import { SelectionActions } from "./components/SelectionActions";
import { HolidayTabContent } from "./components/HolidayTabContent";

interface AdminHolidayReservationsContentProps {
  holidayReservations: HolidayReservationWithChild[] | null;
  isLoading: boolean;
  refetchReservations: () => Promise<unknown>;
}

export const AdminHolidayReservationsContent = ({
  holidayReservations,
  isLoading,
  refetchReservations,
}: AdminHolidayReservationsContentProps) => {
  const {
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
    selectedPeriod,
    setSelectedPeriod,
    filteredHolidayReservations,
    holidayPeriods,
    holidayPagination
  } = useFilteredHolidayReservations(holidayReservations);

  const { holidayPeriods: allHolidayPeriods } = useHolidayPeriods();

  const {
    reservationToDelete,
    setReservationToDelete,
    editingReservation,
    setEditingReservation,
    isSubmitting,
    handleDelete,
    handleUpdate
  } = useReservationActions({ refetchReservations });

  const [editingWithoutMeal, setEditingWithoutMeal] = useState(false);
  const [editingEarlyDropoff, setEditingEarlyDropoff] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  const closeEditDialog = () => {
    setEditingReservation(null);
    setEditingWithoutMeal(false);
    setEditingEarlyDropoff(false);
  };

  const handleEditClick = (reservation: HolidayReservationWithChild) => {
    setEditingReservation(reservation);
    setEditingWithoutMeal(reservation.without_meal);
    setEditingEarlyDropoff(reservation.early_dropoff);
  };

  const handleDeleteClick = (data: { id: string, type: 'wednesday' | 'holiday' }) => {
    setReservationToDelete(data);
  };

  const handleUpdate_ = async () => {
    if (!editingReservation) return;

    const updatedReservation = {
      ...editingReservation,
      without_meal: editingWithoutMeal,
      early_dropoff: editingEarlyDropoff,
    };

    setEditingReservation(updatedReservation);
    await handleUpdate();
    closeEditDialog();
  };

  // Selection handling
  const handleSelectionChange = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedReservations(prev => [...prev, id]);
    } else {
      setSelectedReservations(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = () => {
    if (!filteredHolidayReservations) return;
    
    if (selectedReservations.length === filteredHolidayReservations.length) {
      setSelectedReservations([]);
    } else {
      const allIds = filteredHolidayReservations.map(res => res.id);
      setSelectedReservations(allIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedReservations.length === 0 || isSubmitting) return;
    
    setIsDeletingMultiple(true);
    
    try {
      if (!filteredHolidayReservations) return;
      
      const selectedIdsInCurrentTab = filteredHolidayReservations
        .filter(res => selectedReservations.includes(res.id))
        .map(res => res.id);
      
      if (selectedIdsInCurrentTab.length === 0) {
        toast.info("Aucune réservation sélectionnée");
        setIsDeletingMultiple(false);
        return;
      }
      
      const { error } = await supabase
        .from('holiday_reservations')
        .delete()
        .in('id', selectedIdsInCurrentTab);
      
      if (error) throw error;
      
      await refetchReservations();
      setSelectedReservations(prev => prev.filter(id => !selectedIdsInCurrentTab.includes(id)));
      toast.success(`${selectedIdsInCurrentTab.length} réservation(s) supprimée(s) avec succès`);
    } catch (error) {
      console.error("Erreur lors de la suppression multiple:", error);
      toast.error("Une erreur est survenue lors de la suppression des réservations");
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  const activeReservations = holidayPagination.paginatedData;
  const reservationCount = holidayPagination.totalItems;
  const selectedCount = activeReservations 
    ? activeReservations.filter(res => selectedReservations.includes(res.id)).length 
    : 0;

  // Combine the period lists from reservations and all available periods
  const availablePeriods = [...holidayPeriods];
  
  if (allHolidayPeriods) {
    allHolidayPeriods.forEach(period => {
      if (!availablePeriods.some(p => p.id === period.id)) {
        availablePeriods.push({
          id: period.id,
          name: period.name
        });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReservationToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        wednesdayReservations={null}
        holidayReservations={filteredHolidayReservations}
      />

      <SelectionActions
        selectedCount={selectedCount}
        reservationCount={reservationCount}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
        isDeletingMultiple={isDeletingMultiple}
        activeReservations={activeReservations}
      />

      <HolidayTabContent
        reservations={filteredHolidayReservations}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        selectedReservations={selectedReservations}
        onSelectionChange={handleSelectionChange}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        availablePeriods={availablePeriods}
        pagination={holidayPagination}
      />

      <DeleteReservationDialog
        isOpen={!!reservationToDelete}
        onClose={() => setReservationToDelete(null)}
        onConfirm={handleDelete}
      />

      <EditReservationDialog
        reservation={editingReservation}
        isOpen={!!editingReservation}
        onClose={closeEditDialog}
        onUpdate={handleUpdate_}
        isSubmitting={isSubmitting}
        withoutMeal={editingWithoutMeal}
        earlyDropoff={editingEarlyDropoff}
        onWithoutMealChange={setEditingWithoutMeal}
        onEarlyDropoffChange={setEditingEarlyDropoff}
      />
    </div>
  );
};


import { useQueryClient } from "@tanstack/react-query";
import { EditReservationDialog } from "./EditReservationDialog";
import { DeleteReservationDialog } from "./DeleteReservationDialog";
import { useState } from "react";
import { useReservationActions } from "./ReservationActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { useFilteredReservations } from "./hooks/useFilteredReservations";
import { ReservationToolbar } from "./components/ReservationToolbar";
import { SelectionActions } from "./components/SelectionActions";
import { ReservationTabsContainer } from "./components/ReservationTabsContainer";

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
  refetchReservations,
}: AdminReservationsContentProps) => {
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
    filteredWednesdayReservations,
    filteredHolidayReservations,
    holidayPeriods
  } = useFilteredReservations(wednesdayReservations, holidayReservations);

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
  const [activeTab, setActiveTab] = useState("wednesday");
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  const closeEditDialog = () => {
    setEditingReservation(null);
    setEditingWithoutMeal(false);
    setEditingEarlyDropoff(false);
  };

  const handleEditClick = (reservation: WednesdayReservationWithChild | HolidayReservationWithChild) => {
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
    const currentReservations = activeTab === "wednesday" 
      ? filteredWednesdayReservations 
      : filteredHolidayReservations;
    
    if (!currentReservations) return;
    
    if (selectedReservations.length === currentReservations.length) {
      // Deselect all if all are already selected
      setSelectedReservations([]);
    } else {
      // Select all
      const allIds = currentReservations.map(res => res.id);
      setSelectedReservations(allIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedReservations.length === 0 || isSubmitting) return;
    
    setIsDeletingMultiple(true);
    
    try {
      const currentReservations = activeTab === "wednesday" 
        ? filteredWednesdayReservations 
        : filteredHolidayReservations;
      
      if (!currentReservations) return;
      
      const table = activeTab === "wednesday" ? 'wednesday_reservations' : 'holiday_reservations';
      
      // Delete all selected reservations in the current tab
      const selectedIdsInCurrentTab = currentReservations
        .filter(res => selectedReservations.includes(res.id))
        .map(res => res.id);
      
      if (selectedIdsInCurrentTab.length === 0) {
        toast.info("Aucune réservation sélectionnée dans cet onglet");
        setIsDeletingMultiple(false);
        return;
      }
      
      const { error } = await supabase
        .from(table)
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

  // Calculate the current reservation count based on active tab
  const activeReservations = activeTab === "wednesday" 
    ? filteredWednesdayReservations 
    : filteredHolidayReservations;
  
  const reservationCount = activeReservations?.length || 0;
  const selectedCount = activeReservations 
    ? activeReservations.filter(res => selectedReservations.includes(res.id)).length 
    : 0;

  // Combine the period lists from reservations and all available periods
  const availablePeriods = [...holidayPeriods];
  
  // Add periods that might not have reservations yet
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
        wednesdayReservations={filteredWednesdayReservations}
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

      <ReservationTabsContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wednesdayReservations={filteredWednesdayReservations}
        holidayReservations={filteredHolidayReservations}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        selectedReservations={selectedReservations}
        onSelectionChange={handleSelectionChange}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        availablePeriods={availablePeriods}
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

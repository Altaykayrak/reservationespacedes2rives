
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReservationList } from "./ReservationList";
import { ReservationFilters } from "./ReservationFilters";
import { ExportButtons } from "./ExportButtons";
import { useFilteredReservations } from "./hooks/useFilteredReservations";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { EditReservationDialog } from "./EditReservationDialog";
import { DeleteReservationDialog } from "./DeleteReservationDialog";
import { useState } from "react";
import { useReservationActions } from "./ReservationActions";
import { Button } from "@/components/ui/button";
import { CheckSquare, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";

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
          wednesdayReservations={filteredWednesdayReservations}
          holidayReservations={filteredHolidayReservations}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {/* Information bar with reservation counts and selection actions */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-wrap justify-between items-center gap-3">
        <p className="text-blue-800 font-medium">
          {reservationCount} réservation{reservationCount > 1 ? 's' : ''} affichée{reservationCount > 1 ? 's' : ''}
          {selectedCount > 0 && ` (${selectedCount} sélectionnée${selectedCount > 1 ? 's' : ''})`}
        </p>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSelectAll}
            disabled={!activeReservations || activeReservations.length === 0}
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            {selectedCount === reservationCount && reservationCount > 0 
              ? "Désélectionner tout" 
              : "Sélectionner tout"}
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0 || isDeletingMultiple}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer {selectedCount > 0 ? `(${selectedCount})` : ""}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="wednesday" className="w-full" onValueChange={(value) => {
        setActiveTab(value);
      }}>
        <TabsList className="mb-4">
          <TabsTrigger value="wednesday">Mercredis</TabsTrigger>
          <TabsTrigger value="holiday">Vacances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wednesday">
          <ScrollArea className="h-[600px] pr-4">
            <ReservationList
              reservations={filteredWednesdayReservations}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              selectedReservations={selectedReservations}
              onSelectionChange={handleSelectionChange}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="holiday">
          {/* Sélecteur de périodes de vacances */}
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Filtrer par période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                {availablePeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <ReservationList
              reservations={filteredHolidayReservations}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              selectedReservations={selectedReservations}
              onSelectionChange={handleSelectionChange}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>

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

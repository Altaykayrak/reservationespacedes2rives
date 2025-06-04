import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WednesdayDateSelector } from "@/components/reservations/WednesdayDateSelector";
import { AdminChildSelector } from "./AdminChildSelector";
import { AdminGroupSelector } from "./AdminGroupSelector";
import { AdminQuickActions } from "./AdminQuickActions";
import { AdminReservationDialog } from "./AdminReservationDialog";
import { useWednesdayReservationSubmission } from "@/hooks/useWednesdayReservationSubmission";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminChildrenData } from "@/hooks/useAdminChildrenData";
import { useAdminQuickActions } from "./hooks/useAdminQuickActions";
import { format } from "date-fns";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface AdminReservationFormProps {
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  resetForm: () => void;
}

export const AdminReservationForm = ({
  selectedChild,
  setSelectedChild,
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  resetForm
}: AdminReservationFormProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [reservedDate, setReservedDate] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const { wednesdayEligibleChildren, isLoading } = useAdminChildrenData();

  // Récupérer les informations de l'enfant sélectionné pour déterminer sa classe
  const { data: childInfo } = useQuery({
    queryKey: ["selectedChild", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return null;
      
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild,
  });

  const isKindergarten = childInfo?.school_class && ["PS", "MS", "GS"].includes(childInfo.school_class);
  const isPrimary = childInfo?.school_class && ["CP", "CE1", "CE2", "CM1", "CM2"].includes(childInfo.school_class);

  // Requête pour récupérer les réservations existantes
  const { data: existingReservations } = useQuery({
    queryKey: ["wednesday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      
      const { data, error } = await supabase
        .from("wednesday_reservations")
        .select(`
          id,
          wednesday_id,
          child_id,
          available_wednesdays!fk_wednesday_id (
            date
          )
        `)
        .eq("child_id", selectedChild)
        .eq("status", "confirmed");

      if (error) {
        console.error("Erreur lors de la récupération des réservations:", error);
        throw error;
      }

      return data;
    },
    enabled: !!selectedChild,
  });

  const isDateReservedForChild = (date: Date) => {
    if (!existingReservations) return false;
    
    const dateStr = format(date, "yyyy-MM-dd");
    return existingReservations.some(
      reservation => reservation.available_wednesdays?.date === dateStr
    );
  };

  // Hook pour les actions rapides
  const { selectAllDates, selectAllDatesWithoutMeal, selectAllDatesWithEarlyDropoff } = useAdminQuickActions({
    selectedChild,
    isKindergarten: Boolean(isKindergarten),
    isPrimary: Boolean(isPrimary),
    isDateReservedForChild,
    selectedDates,
    handleDateToggle,
    handleOptionChange
  });

  const handleDateSelection = (date: Date) => {
    if (selectedChild && isDateReservedForChild(date)) {
      setReservedDate(date);
      setShowReservationDialog(true);
    } else {
      handleDateToggle(date);
    }
  };

  const refetchReservations = async () => {
    await queryClient.invalidateQueries({ queryKey: ["wednesday_reservations"] });
  };

  const { handleSubmit } = useWednesdayReservationSubmission(
    selectedChild,
    selectedDates,
    isDateReservedForChild,
    refetchReservations,
    resetForm
  );

  // Filtrer les enfants basés sur le groupe sélectionné et exclure les PS et les ados
  const filteredChildren = wednesdayEligibleChildren?.filter(child => {
    const schoolClass = child.school_class.toUpperCase();
    
    if (selectedGroup === "all") return true;
    if (selectedGroup === "maternelle") {
      return ["MS", "GS"].includes(schoolClass);
    }
    if (selectedGroup === "primaire") {
      return ["CP", "CE1", "CE2", "CM1", "CM2"].includes(schoolClass);
    }
    return true;
  });

  if (isLoading) {
    return <div>Chargement des enfants...</div>;
  }

  return (
    <div className="space-y-6">
      <Alert>
        <CalendarDays className="h-4 w-4" />
        <AlertDescription>
          Mode administrateur : Vous pouvez sélectionner n'importe quel enfant et créer des réservations à la place des parents.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <AdminGroupSelector
            selectedGroup={selectedGroup}
            onGroupChange={setSelectedGroup}
            onChildReset={() => setSelectedChild("")}
          />

          <div className="mt-4">
            <AdminChildSelector
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
              children={filteredChildren}
              setSelectedDates={() => {}}
            />
          </div>

          <AdminQuickActions
            selectedChild={selectedChild}
            onSelectAllDates={selectAllDates}
            onSelectAllDatesWithoutMeal={selectAllDatesWithoutMeal}
            onSelectAllDatesWithEarlyDropoff={selectAllDatesWithEarlyDropoff}
          />

          <ScrollArea className="h-[400px]">
            <WednesdayDateSelector
              selectedDates={selectedDates}
              handleDateToggle={handleDateSelection}
              handleOptionChange={handleOptionChange}
              isDateAlreadyReserved={isDateReservedForChild}
              selectedChild={selectedChild}
            />
          </ScrollArea>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!selectedChild || selectedDates.length === 0}
          >
            Confirmer {selectedDates.length > 1 ? 'les réservations' : 'la réservation'}
          </Button>
        </div>
      </Card>

      <AdminReservationDialog
        open={showReservationDialog}
        onOpenChange={setShowReservationDialog}
        reservedDate={reservedDate}
      />
    </div>
  );
};

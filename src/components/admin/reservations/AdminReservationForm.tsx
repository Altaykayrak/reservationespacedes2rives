
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChildrenData } from "@/hooks/useChildrenData";
import { WednesdayDateSelector } from "@/components/reservations/WednesdayDateSelector";
import { ChildSelector } from "@/components/reservations/ChildSelector";
import { useWednesdayReservationSubmission } from "@/hooks/useWednesdayReservationSubmission";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const { children, isLoading } = useChildrenData();
  const { refetchReservations } = useReservationQueries();

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

  const handleDateSelection = (date: Date) => {
    if (selectedChild && isDateReservedForChild(date)) {
      setReservedDate(date);
      setShowReservationDialog(true);
    } else {
      handleDateToggle(date);
    }
  };

  const { handleSubmit } = useWednesdayReservationSubmission(
    selectedChild,
    selectedDates,
    isDateReservedForChild,
    refetchReservations,
    resetForm
  );

  const filteredChildren = children?.filter(child => {
    if (selectedGroup === "all") return true;
    const schoolClass = child.school_class.toUpperCase();
    if (selectedGroup === "maternelle") {
      return ["PS", "MS", "GS"].includes(schoolClass);
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
          Vous pouvez sélectionner plusieurs mercredis à la fois pour créer des réservations.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sélectionner un groupe</Label>
            <Select
              value={selectedGroup}
              onValueChange={(value) => {
                console.log("Groupe sélectionné:", value);
                setSelectedGroup(value);
                setSelectedChild("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les groupes</SelectItem>
                <SelectItem value="maternelle">Maternelle</SelectItem>
                <SelectItem value="primaire">Primaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <ChildSelector
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
              children={filteredChildren}
              setSelectedDates={() => {}}
            />
          </div>

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

      <Dialog open={showReservationDialog} onOpenChange={setShowReservationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Date déjà réservée</DialogTitle>
            <DialogDescription>
              {reservedDate && `Une réservation existe déjà pour le ${format(reservedDate, "EEEE d MMMM yyyy", { locale: fr })}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowReservationDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

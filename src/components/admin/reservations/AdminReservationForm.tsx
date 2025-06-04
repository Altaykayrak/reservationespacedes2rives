import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, CheckSquare, Clock, Utensils } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WednesdayDateSelector } from "@/components/reservations/WednesdayDateSelector";
import { AdminChildSelector } from "./AdminChildSelector";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminChildrenData } from "@/hooks/useAdminChildrenData";
import { useToast } from "@/hooks/use-toast";
import { useAvailableWednesdays } from "@/hooks/useAvailableWednesdays";

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
  const { toast } = useToast();

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

  // Utiliser le hook avec isAdminMode=true pour avoir accès aux mercredis dès le lendemain
  const { data: availableWednesdays = [] } = useAvailableWednesdays(
    Boolean(isKindergarten),
    Boolean(isPrimary),
    true // isAdminMode = true
  );

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

  // Créer des fonctions qui modifient directement l'état local
  const selectAllDates = async () => {
    if (!selectedChild || !availableWednesdays.length) return;

    try {
      const availableDates = [];
      const fullDates = [];

      // Utiliser les mercredis filtrés par useAvailableWednesdays
      for (const wednesday of availableWednesdays) {
        const date = new Date(wednesday.date);
        const isReserved = isDateReservedForChild(date);
        
        if (isReserved) continue;

        // Vérifier si le mercredi est complet
        let spotsLeft = 0;
        if (isKindergarten) {
          spotsLeft = wednesday.max_participants_kindergarten - wednesday.kindergartenReservations;
        } else if (isPrimary) {
          spotsLeft = wednesday.max_participants_primary - wednesday.primaryReservations;
        }

        if (spotsLeft <= 0) {
          fullDates.push(date);
        } else {
          availableDates.push({
            date,
            withoutMeal: false,
            earlyDropoff: false
          });
        }
      }

      // Vider d'abord toutes les sélections
      selectedDates.forEach(dateOption => {
        handleDateToggle(dateOption.date);
      });

      // Sélectionner toutes les dates disponibles
      availableDates.forEach(dateOption => {
        handleDateToggle(dateOption.date);
      });

      // Afficher un message si certains mercredis sont complets
      if (fullDates.length > 0) {
        const fullDatesText = fullDates
          .map(date => date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          }))
          .join(', ');

        toast({
          title: "Mercredis complets",
          description: `Les mercredis suivants sont complets et n'ont pas été sélectionnés : ${fullDatesText}. Vous pouvez contacter l'accueil pour être mis en liste d'attente.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sélection automatique:", error);
    }
  };

  const selectAllDatesWithoutMeal = async () => {
    await selectAllDates();
    // Attendre que React mette à jour l'état, puis modifier les options
    setTimeout(() => {
      selectedDates.forEach(dateOption => {
        handleOptionChange(dateOption.date, 'withoutMeal', true);
      });
    }, 100);
  };

  const selectAllDatesWithEarlyDropoff = async () => {
    await selectAllDates();
    // Attendre que React mette à jour l'état, puis modifier les options
    setTimeout(() => {
      selectedDates.forEach(dateOption => {
        handleOptionChange(dateOption.date, 'earlyDropoff', true);
      });
    }, 100);
  };

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
          <div className="space-y-2">
            <Label>Sélectionner un groupe</Label>
            <Select
              value={selectedGroup}
              onValueChange={(value) => {
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
            <AdminChildSelector
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
              children={filteredChildren}
              setSelectedDates={() => {}}
            />
          </div>

          {selectedChild && (
            <div className="space-y-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2" 
                onClick={selectAllDates}
              >
                <CheckSquare className="h-4 w-4" />
                Sélectionner tous les mercredis
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2" 
                onClick={selectAllDatesWithoutMeal}
              >
                <Utensils className="h-4 w-4" />
                Tous sans repas
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2" 
                onClick={selectAllDatesWithEarlyDropoff}
              >
                <Clock className="h-4 w-4" />
                Tous avec un accueil avant 8h30
              </Button>
            </div>
          )}

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

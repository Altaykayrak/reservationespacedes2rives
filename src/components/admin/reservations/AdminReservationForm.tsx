
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChildrenData } from "@/hooks/useChildrenData";
import { WednesdayDateSelector } from "@/components/reservations/WednesdayDateSelector";
import { ChildSelector } from "@/components/reservations/ChildSelector";
import { useWednesdayReservationSubmission } from "@/hooks/useWednesdayReservationSubmission";
import { useReservationQueries } from "@/hooks/useReservationQueries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const [showReservationAlert, setShowReservationAlert] = useState(false);
  const [reservedDate, setReservedDate] = useState<Date | null>(null);

  const { children, isLoading } = useChildrenData();
  const { isDateReservedForChild, refetchReservations } = useReservationQueries();
  
  const { handleSubmit } = useWednesdayReservationSubmission(
    selectedChild,
    selectedDates,
    (date) => isDateReservedForChild(selectedChild, date),
    refetchReservations,
    resetForm
  );

  const handleDateSelection = (date: Date) => {
    console.log("Date sélectionnée:", date);
    console.log("Enfant sélectionné:", selectedChild);
    if (selectedChild && isDateReservedForChild(selectedChild, date)) {
      console.log("Date déjà réservée, affichage de l'alerte");
      setReservedDate(date);
      setShowReservationAlert(true);
    } else {
      console.log("Date non réservée, ajout à la sélection");
      handleDateToggle(date);
    }
  };

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
            <Label>Groupe</Label>
            <Select
              value={selectedGroup}
              onValueChange={(value) => {
                setSelectedGroup(value);
                setSelectedChild("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les groupes</SelectItem>
                <SelectItem value="maternelle">Maternelle</SelectItem>
                <SelectItem value="primaire">Primaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ChildSelector
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            children={filteredChildren}
            setSelectedDates={() => {}}
          />

          <ScrollArea className="h-[400px]">
            <WednesdayDateSelector
              selectedDates={selectedDates}
              handleDateToggle={handleDateSelection}
              handleOptionChange={handleOptionChange}
              isDateAlreadyReserved={(date) => isDateReservedForChild(selectedChild, date)}
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

      <AlertDialog open={showReservationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réservation existante</AlertDialogTitle>
            <AlertDialogDescription>
              {reservedDate && `Une réservation existe déjà pour le ${format(reservedDate, "EEEE d MMMM yyyy", { locale: fr })}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowReservationAlert(false)}>
              D'accord
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

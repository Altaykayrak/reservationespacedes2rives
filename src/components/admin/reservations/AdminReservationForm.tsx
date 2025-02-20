
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
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const { children, isLoading } = useChildrenData();
  const { isDateReservedForChild, refetchReservations } = useReservationQueries();
  
  const { handleSubmit } = useWednesdayReservationSubmission(
    selectedChild,
    selectedDates,
    (date) => isDateReservedForChild(selectedChild, date),
    refetchReservations,
    resetForm
  );

  const filteredChildren = children?.filter(child => {
    if (!selectedGroup) return true;
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
                setSelectedChild(""); // Réinitialiser l'enfant sélectionné lors du changement de groupe
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les groupes</SelectItem>
                <SelectItem value="maternelle">Maternelle</SelectItem>
                <SelectItem value="primaire">Primaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ChildSelector
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            children={filteredChildren}
            setSelectedDates={() => {}} // On n'utilise pas cette prop dans le contexte admin
          />

          <ScrollArea className="h-[400px]">
            <WednesdayDateSelector
              selectedDates={selectedDates}
              handleDateToggle={handleDateToggle}
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
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";

type Child = Tables<"children">;

interface ReservationFormProps {
  selectedDates: Date[];
  children?: Child[];
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  withoutMeal: boolean;
  setWithoutMeal: (value: boolean) => void;
  earlyDropoff: boolean;
  setEarlyDropoff: (value: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ReservationForm = ({
  selectedDates,
  children,
  selectedChild,
  setSelectedChild,
  withoutMeal,
  setWithoutMeal,
  earlyDropoff,
  setEarlyDropoff,
  onSubmit,
  isSubmitting,
}: ReservationFormProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Détails de la réservation</h2>
      {selectedDates.length > 0 ? (
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-2">Dates sélectionnées :</p>
            <ul className="list-disc pl-5">
              {selectedDates.map((date) => (
                <li key={date.toISOString()}>
                  {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="child-select">Sélectionner un enfant</Label>
              <select
                id="child-select"
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full mt-1 rounded-md border border-gray-300 p-2"
              >
                <option value="">Choisir un enfant</option>
                {children?.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="without-meal"
                  checked={withoutMeal}
                  onCheckedChange={(checked) => setWithoutMeal(checked as boolean)}
                />
                <Label htmlFor="without-meal">Sans repas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="early-dropoff"
                  checked={earlyDropoff}
                  onCheckedChange={(checked) => setEarlyDropoff(checked as boolean)}
                />
                <Label htmlFor="early-dropoff">Accueil avant 8h30</Label>
              </div>
            </div>

            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Réservation en cours..." : "Confirmer la réservation"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">
          Veuillez sélectionner une ou plusieurs dates dans le calendrier
        </p>
      )}
    </div>
  );
};
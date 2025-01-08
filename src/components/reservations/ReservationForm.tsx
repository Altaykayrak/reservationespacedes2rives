import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Child = Tables<"children">;

interface DateOptions {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface ReservationFormProps {
  selectedDates: Date[];
  children?: Child[];
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  setSelectedDates: (dates: DateOptions[]) => void;
}

const ALLOWED_CLASSES = [
  "CP",
  "CE1",
  "CE2",
  "CM1",
  "CM2",
  "Moyenne Section",
  "Grande section"
];

export const ReservationForm = ({
  selectedDates,
  children,
  selectedChild,
  setSelectedChild,
  onSubmit,
  isSubmitting,
  setSelectedDates,
}: ReservationFormProps) => {
  const [dateOptions, setDateOptions] = useState<DateOptions[]>([]);

  // Filter children to only show primary and kindergarten classes
  const filteredChildren = children?.filter(child => 
    ALLOWED_CLASSES.includes(child.school_class)
  );

  // Update dateOptions when selectedDates changes
  useEffect(() => {
    const newDateOptions = selectedDates.map(date => {
      const existingOptions = dateOptions.find(
        opt => opt.date.getTime() === date.getTime()
      );
      return {
        date,
        withoutMeal: existingOptions?.withoutMeal || false,
        earlyDropoff: existingOptions?.earlyDropoff || false,
      };
    });
    setDateOptions(newDateOptions);
    setSelectedDates(newDateOptions);
  }, [selectedDates]); // Only depend on selectedDates

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    const newDateOptions = dateOptions.map(opt =>
      opt.date.getTime() === date.getTime()
        ? { ...opt, [option]: value }
        : opt
    );
    setDateOptions(newDateOptions);
    setSelectedDates(newDateOptions);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Détails de la réservation</h2>
      {selectedDates.length > 0 ? (
        <div className="space-y-6">
          <div>
            <Label htmlFor="child-select">Sélectionner un enfant</Label>
            <select
              id="child-select"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full mt-1 rounded-md border border-gray-300 p-2"
            >
              <option value="">Choisir un enfant</option>
              {filteredChildren?.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.first_name} {child.last_name} ({child.school_class})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {dateOptions.map((dateOpt) => (
              <div key={dateOpt.date.toISOString()} className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">
                  {format(dateOpt.date, "EEEE d MMMM yyyy", { locale: fr })}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`without-meal-${dateOpt.date.toISOString()}`}
                      checked={dateOpt.withoutMeal}
                      onCheckedChange={(checked) =>
                        handleOptionChange(dateOpt.date, 'withoutMeal', checked as boolean)
                      }
                    />
                    <Label htmlFor={`without-meal-${dateOpt.date.toISOString()}`}>
                      Sans repas
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`early-dropoff-${dateOpt.date.toISOString()}`}
                      checked={dateOpt.earlyDropoff}
                      onCheckedChange={(checked) =>
                        handleOptionChange(dateOpt.date, 'earlyDropoff', checked as boolean)
                      }
                    />
                    <Label htmlFor={`early-dropoff-${dateOpt.date.toISOString()}`}>
                      Accueil avant 8h30
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Réservation en cours..." : "Confirmer la réservation"}
          </Button>
        </div>
      ) : (
        <p className="text-gray-500">
          Veuillez sélectionner une ou plusieurs dates dans la liste
        </p>
      )}
    </div>
  );
};
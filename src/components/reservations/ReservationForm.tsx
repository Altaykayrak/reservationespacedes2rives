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
  "6ème",
  "5ème",
  "4ème",
  "3ème",
  "Petite Section",
  "Moyenne Section",
  "GS"
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

  const filteredChildren = children?.filter(child => 
    ALLOWED_CLASSES.includes(child.school_class)
  );

  // Mise à jour des options de date uniquement lorsque selectedDates change
  useEffect(() => {
    const newDateOptions = selectedDates.map(date => {
      const existingOption = dateOptions.find(
        opt => opt.date.getTime() === date.getTime()
      );
      return existingOption || {
        date,
        withoutMeal: false,
        earlyDropoff: false,
      };
    });
    setDateOptions(newDateOptions);
    setSelectedDates(newDateOptions);
  }, [selectedDates]);

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
    <div className="space-y-4">
      {selectedDates.length > 0 ? (
        <div className="space-y-6">
          <div>
            <Label htmlFor="child-select" className="text-sm md:text-base">Sélectionner un enfant</Label>
            <select
              id="child-select"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full mt-2 rounded-md border border-gray-300 p-2 text-sm md:text-base"
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
              <div key={dateOpt.date.toISOString()} className="border p-3 md:p-4 rounded-lg">
                <h3 className="font-medium text-sm md:text-base mb-3">
                  {format(dateOpt.date, "EEEE d MMMM yyyy", { locale: fr })}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`without-meal-${dateOpt.date.toISOString()}`}
                      checked={dateOpt.withoutMeal}
                      onCheckedChange={(checked) =>
                        handleOptionChange(dateOpt.date, 'withoutMeal', checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`without-meal-${dateOpt.date.toISOString()}`}
                      className="text-sm md:text-base"
                    >
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
                    <Label 
                      htmlFor={`early-dropoff-${dateOpt.date.toISOString()}`}
                      className="text-sm md:text-base"
                    >
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
            className="w-full text-sm md:text-base py-2 md:py-3"
          >
            {isSubmitting ? "Réservation en cours..." : "Confirmer la réservation"}
          </Button>
        </div>
      ) : (
        <p className="text-gray-500 text-sm md:text-base">
          Veuillez sélectionner une ou plusieurs dates dans la liste
        </p>
      )}
    </div>
  );
};
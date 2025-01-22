import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAvailableDates } from "@/hooks/useAvailableDates";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface ReservationFormProps {
  selectedDates: Date[];
  children?: Tables<"children">[];
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  setSelectedDates: (dates: DateOption[]) => void;
}

export const ReservationForm = ({
  selectedDates,
  selectedChild,
  onSubmit,
  isSubmitting,
  setSelectedDates,
}: ReservationFormProps) => {
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const { availableWednesdays } = useAvailableDates();

  useEffect(() => {
    const newDateOptions = selectedDates.map(date => ({
      date,
      withoutMeal: false,
      earlyDropoff: false,
    }));
    setDateOptions(newDateOptions);
    setSelectedDates(newDateOptions);
  }, [selectedDates, setSelectedDates]);

  const handleDateToggle = (date: Date) => {
    const existingDate = dateOptions.find(d => 
      format(d.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    if (existingDate) {
      const newDateOptions = dateOptions.filter(d => 
        format(d.date, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')
      );
      setDateOptions(newDateOptions);
      setSelectedDates(newDateOptions);
    } else {
      const newDateOptions = [...dateOptions, { date, withoutMeal: false, earlyDropoff: false }];
      setDateOptions(newDateOptions);
      setSelectedDates(newDateOptions);
    }
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', checked: boolean) => {
    const newDateOptions = dateOptions.map(d => 
      format(d.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ? { ...d, [option]: checked }
        : d
    );
    setDateOptions(newDateOptions);
    setSelectedDates(newDateOptions);
  };

  // Filter out past dates and sort chronologically
  const availableDates = availableWednesdays
    ?.filter(wednesday => {
      const wednesdayDate = new Date(wednesday.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return wednesdayDate >= today;
    })
    .map(wednesday => new Date(wednesday.date))
    .sort((a, b) => a.getTime() - b.getTime()) || [];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {availableDates.map((date) => {
          const selectedDate = dateOptions.find(d => 
            format(d.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );
          const isSelected = !!selectedDate;

          return (
            <div key={date.toISOString()} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={date.toISOString()}
                    checked={isSelected}
                    onCheckedChange={() => handleDateToggle(date)}
                    className="h-5 w-5"
                  />
                  <Label 
                    htmlFor={date.toISOString()} 
                    className="text-base text-gray-900"
                  >
                    {format(date, "EEEE d MMMM", { locale: fr })}
                  </Label>
                </div>

                {isSelected && (
                  <div className="ml-7 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`without-meal-${date.toISOString()}`}
                        checked={selectedDate?.withoutMeal || false}
                        onCheckedChange={(checked) => {
                          if (typeof checked === 'boolean') {
                            handleOptionChange(date, 'withoutMeal', checked);
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <Label 
                        htmlFor={`without-meal-${date.toISOString()}`}
                        className="text-sm text-gray-600"
                      >
                        Sans repas
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`early-dropoff-${date.toISOString()}`}
                        checked={selectedDate?.earlyDropoff || false}
                        onCheckedChange={(checked) => {
                          if (typeof checked === 'boolean') {
                            handleOptionChange(date, 'earlyDropoff', checked);
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <Label 
                        htmlFor={`early-dropoff-${date.toISOString()}`}
                        className="text-sm text-gray-600"
                      >
                        Accueil avant 8h30
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !selectedChild}
          className="w-full text-sm md:text-base py-2 md:py-3"
        >
          {isSubmitting ? "Réservation en cours..." : "Confirmer la réservation"}
        </Button>
      )}
    </div>
  );
};
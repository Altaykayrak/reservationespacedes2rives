
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface WednesdayOptionsProps {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
  onOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
}

export const WednesdayOptions = ({ 
  date, 
  withoutMeal, 
  earlyDropoff, 
  onOptionChange 
}: WednesdayOptionsProps) => {
  return (
    <div className="ml-6 space-y-1 bg-white/50 p-2 rounded-md">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`without-meal-${date}`}
          checked={withoutMeal}
          onCheckedChange={(checked) =>
            onOptionChange(date, 'withoutMeal', checked as boolean)
          }
          className="border-green-200"
        />
        <Label 
          htmlFor={`without-meal-${date}`}
          className="text-sm text-green-900"
        >
          Sans repas
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`early-dropoff-${date}`}
          checked={earlyDropoff}
          onCheckedChange={(checked) =>
            onOptionChange(date, 'earlyDropoff', checked as boolean)
          }
          className="border-green-200"
        />
        <Label 
          htmlFor={`early-dropoff-${date}`}
          className="text-sm text-green-900"
        >
          Accueil avant 8h30
        </Label>
      </div>
    </div>
  );
};

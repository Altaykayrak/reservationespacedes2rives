
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DateOptionsProps {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
  onOptionChange: (option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isTeenClass?: boolean;
}

export const DateOptions = ({ 
  date, 
  withoutMeal, 
  earlyDropoff, 
  onOptionChange,
  isTeenClass = false 
}: DateOptionsProps) => {
  const isTeenPage = window.location.pathname === "/teenholiday-reservations" ||
                      window.location.pathname === "/admin/reservations/new-teen-holiday" ||
                      window.location.pathname === "/admin/new-teenholiday-reservation";
  
  // Pour les ados sur la page Club Ado, la case "Sans repas" est toujours cochée et non-modifiable
  const isReadOnly = isTeenPage && isTeenClass;
  
  return (
    <div className="ml-6 space-y-1 bg-white/50 p-2 rounded-md">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`without-meal-${date.toISOString()}`}
          checked={isReadOnly ? true : withoutMeal}
          onCheckedChange={(checked) =>
            isReadOnly ? null : onOptionChange('withoutMeal', checked as boolean)
          }
          disabled={isReadOnly}
          className={`border-blue-200 ${isReadOnly ? 'opacity-70' : ''}`}
        />
        <Label 
          htmlFor={`without-meal-${date.toISOString()}`}
          className={`text-sm text-blue-900 ${isReadOnly ? 'opacity-70' : ''}`}
        >
          Sans repas
        </Label>
      </div>
      
      {/* Hide early dropoff option for teen classes */}
      {!isTeenClass && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`early-dropoff-${date.toISOString()}`}
            checked={earlyDropoff}
            onCheckedChange={(checked) =>
              onOptionChange('earlyDropoff', checked as boolean)
            }
            className="border-blue-200"
          />
          <Label 
            htmlFor={`early-dropoff-${date.toISOString()}`}
            className="text-sm text-blue-900"
          >
            Accueil avant 8h30
          </Label>
        </div>
      )}
    </div>
  );
};

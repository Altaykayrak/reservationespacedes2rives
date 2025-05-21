
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DateOptionsProps {
  date?: Date; // Make date optional since it sometimes might not be provided
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
  
  // Generate a unique ID that doesn't rely on date if it's not provided
  const generateId = (prefix: string) => {
    if (date) {
      return `${prefix}-${date.toISOString()}`;
    }
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  };
  
  // Fonction pour arrêter la propagation des événements afin d'éviter de déclencher l'événement de la date parent
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="ml-6 space-y-1 bg-white/50 p-2 rounded-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center space-x-2">
        <div onClick={handleCheckboxClick}>
          <Checkbox
            id={generateId("without-meal")}
            checked={isReadOnly ? true : withoutMeal}
            onCheckedChange={(checked) =>
              isReadOnly ? null : onOptionChange('withoutMeal', checked as boolean)
            }
            disabled={isReadOnly}
            className={`border-blue-200 pointer-events-auto ${isReadOnly ? 'opacity-70' : ''}`}
          />
        </div>
        <Label 
          htmlFor={generateId("without-meal")}
          className={`text-sm text-blue-900 ${isReadOnly ? 'opacity-70' : ''}`}
          onClick={handleLabelClick}
        >
          Sans repas
        </Label>
      </div>
      
      {/* Hide early dropoff option for teen classes */}
      {!isTeenClass && (
        <div className="flex items-center space-x-2">
          <div onClick={handleCheckboxClick}>
            <Checkbox
              id={generateId("early-dropoff")}
              checked={earlyDropoff}
              onCheckedChange={(checked) =>
                onOptionChange('earlyDropoff', checked as boolean)
              }
              className="border-blue-200 pointer-events-auto"
            />
          </div>
          <Label 
            htmlFor={generateId("early-dropoff")}
            className="text-sm text-blue-900"
            onClick={handleLabelClick}
          >
            Accueil avant 8h30
          </Label>
        </div>
      )}
    </div>
  );
};

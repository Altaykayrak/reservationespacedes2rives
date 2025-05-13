
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useRef, useEffect } from "react";

interface HolidayPeriod {
  id: string;
  name: string;
}

interface HolidayPeriodFilterProps {
  selectedPeriod: string;
  setSelectedPeriod: (periodId: string) => void;
  availablePeriods: HolidayPeriod[];
}

export const HolidayPeriodFilter = ({
  selectedPeriod,
  setSelectedPeriod,
  availablePeriods,
}: HolidayPeriodFilterProps) => {
  const eventHandled = useRef(false);
  
  // Log pour le débogage
  useEffect(() => {
    console.log("[HolidayPeriodFilter] Rendu avec:", { 
      selectedPeriod, 
      availablePeriods: availablePeriods?.length 
    });
  }, [selectedPeriod, availablePeriods]);
  
  const handlePeriodChange = (newValue: string) => {
    // Éviter les déclenchements multiples du même événement
    if (eventHandled.current) {
      return;
    }
    
    try {
      eventHandled.current = true;
      
      // Log détaillé pour tracer l'exécution
      console.log("[HolidayPeriodFilter] Changement de période:", { 
        ancien: selectedPeriod, 
        nouveau: newValue 
      });
      
      // Appeler le setter avec le nouveau ID de période
      setSelectedPeriod(newValue);
      
      // Reset le flag après un court délai
      setTimeout(() => {
        eventHandled.current = false;
      }, 100);
    } catch (error) {
      console.error("[HolidayPeriodFilter] Erreur lors du changement de période:", error);
      eventHandled.current = false;
    }
  };

  return (
    <div className="mb-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Calendar className="h-5 w-5 text-gray-500" />
      <Select 
        value={selectedPeriod} 
        onValueChange={handlePeriodChange}
      >
        <SelectTrigger 
          className="w-[280px]" 
          onClick={(e) => {
            // Empêcher toute propagation qui pourrait déclencher des soumissions de formulaire
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <SelectValue placeholder="Filtrer par période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les périodes</SelectItem>
          {availablePeriods.map((period) => (
            <SelectItem key={period.id} value={period.id}>
              {period.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

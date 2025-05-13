
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useRef, useEffect, useState } from "react";

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
  const isInitialMount = useRef(true);
  const [initialized, setInitialized] = useState(false);
  
  // Log pour le débogage
  useEffect(() => {
    console.log("[HolidayPeriodFilter] Rendu avec:", { 
      selectedPeriod, 
      availablePeriodsCount: availablePeriods?.length,
      initialized
    });
  }, [selectedPeriod, availablePeriods, initialized]);
  
  // Effet d'initialisation
  useEffect(() => {
    // Initialisation forcée si pas encore fait et que des périodes sont disponibles
    if (!initialized && availablePeriods && availablePeriods.length > 0) {
      console.log("[HolidayPeriodFilter] Initialisation forcée");
      
      if (!selectedPeriod || selectedPeriod === "all") {
        // Si aucune période sélectionnée ou "all", sélectionner la première période disponible
        console.log("[HolidayPeriodFilter] Auto-sélection de la première période disponible:", availablePeriods[0].id);
        setSelectedPeriod(availablePeriods[0].id);
      }
      
      setInitialized(true);
    }
    
    isInitialMount.current = false;
  }, [availablePeriods, selectedPeriod, setSelectedPeriod, initialized]);
  
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
    <div className="mb-4 flex items-center gap-2">
      <Calendar className="h-5 w-5 text-gray-500" />
      <Select 
        value={selectedPeriod} 
        onValueChange={handlePeriodChange}
      >
        <SelectTrigger 
          className="w-[280px]" 
          onClick={(e) => {
            // Empêcher toute propagation
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <SelectValue placeholder="Filtrer par période" />
        </SelectTrigger>
        <SelectContent onClick={(e) => e.stopPropagation()}>
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

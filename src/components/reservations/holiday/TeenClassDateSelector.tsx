
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateItem } from "./DateItem";
import { useHolidayPeriodContext } from "./HolidayPeriodContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
import HolidaySpotsBadge from "@/components/reservations/HolidaySpotsBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeenClassDateSelectorProps {
  selectedDates: {
    date: Date;
    withoutMeal: boolean;
    earlyDropoff: boolean;
  }[];
  isDateAlreadyReserved: (date: Date) => boolean;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  handleDateToggle: (date: Date) => void;
  periodId: string;
}

export const TeenClassDateSelector: React.FC<TeenClassDateSelectorProps> = ({
  selectedDates,
  isDateAlreadyReserved,
  handleOptionChange,
  handleDateToggle,
  periodId
}) => {
  const {
    holidayPeriod,
    childInfo,
    isTeenClass
  } = useHolidayPeriodContext();
  
  const [isBlinking, setIsBlinking] = useState(true);
  const [fullDates, setFullDates] = useState<{[key: string]: boolean}>({});
  
  // Effect to disable blinking after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBlinking(false);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, []);

  // Récupérer les informations sur la disponibilité des places
  const { data: spotsData } = useQuery({
    queryKey: ["teen_spots_availability", periodId, childInfo?.school_class],
    queryFn: async () => {
      if (!periodId || !childInfo?.school_class) return {};
      
      // Générer les dates pour la période
      const dates = generateDatesForPeriod();
      if (!dates.length) return {};
      
      const spots: {[key: string]: number} = {};
      
      // Récupérer les places disponibles pour chaque date
      for (const date of dates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        try {
          const { data, error } = await supabase.rpc(
            'check_holiday_spots_available',
            {
              p_period_id: periodId,
              p_reservation_date: dateStr,
              p_child_school_class: childInfo?.school_class
            }
          );
          
          if (error) {
            console.error(`Erreur lors de la vérification des places pour ${dateStr}:`, error);
            spots[dateStr] = -1; // Valeur d'erreur
          } else {
            spots[dateStr] = data;
            // Si pas de places disponibles, on marque la date comme complète
            if (data <= 0) {
              setFullDates(prev => ({...prev, [dateStr]: true}));
            }
          }
        } catch (err) {
          console.error(`Erreur lors de la vérification des places pour ${dateStr}:`, err);
          spots[dateStr] = -1; // Valeur d'erreur
        }
      }
      
      return spots;
    },
    enabled: !!periodId && !!childInfo?.school_class,
    staleTime: 60000 // 1 minute
  });

  console.log("TeenClassDateSelector - Dates complètes:", fullDates);
  console.log("TeenClassDateSelector - spotsData:", spotsData);

  // Générer les dates de la période
  const generateDatesForPeriod = () => {
    if (!holidayPeriod) return [];
    
    try {
      // S'assurer que start_date et end_date sont des dates valides
      let startDate: Date;
      let endDate: Date;
      
      try {
        startDate = new Date(holidayPeriod.start_date);
        if (isNaN(startDate.getTime())) {
          console.error("Start date invalide:", holidayPeriod.start_date);
          return [];
        }
      } catch (err) {
        console.error("Erreur lors du parsing de la start_date:", err);
        return [];
      }
      
      try {
        endDate = new Date(holidayPeriod.end_date);
        if (isNaN(endDate.getTime())) {
          console.error("End date invalide:", holidayPeriod.end_date);
          return [];
        }
      } catch (err) {
        console.error("Erreur lors du parsing de la end_date:", err);
        return [];
      }
      
      const dateArray = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        // On ignore les samedis (6) et dimanches (0)
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          dateArray.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dateArray;
    } catch (error) {
      console.error("Erreur lors de la génération des dates:", error);
      return [];
    }
  };

  // Obtenir toutes les dates de la période
  const periodDates = generateDatesForPeriod();

  // Convertir les selectedDates en format lisible pour la comparaison
  const selectedDatesMap = new Map(
    selectedDates.map(d => {
      // Vérifier que d.date est une instance valide de Date
      if (!(d.date instanceof Date) || isNaN(d.date.getTime())) {
        console.error("Date invalide détectée dans selectedDates:", d.date);
        return ["invalid-date", d];
      }
      const dateStr = format(new Date(d.date), 'yyyy-MM-dd');
      return [dateStr, d];
    })
  );
  
  // Fonction pour vérifier explicitement si une date est sélectionnée
  const isDateSelected = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    const dateStr = format(new Date(date), 'yyyy-MM-dd');
    return selectedDatesMap.has(dateStr);
  };
  
  // Fonction pour vérifier si une date est complète (plus de places)
  const isDateFull = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    const dateStr = format(new Date(date), 'yyyy-MM-dd');
    return fullDates[dateStr] === true || (spotsData && spotsData[dateStr] <= 0);
  };
  
  // Fonction pour gérer le click sur une date
  const onDateToggle = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Tentative de toggle sur une date invalide:", date);
      return;
    }
    
    // Vérifier si la date est complète et déjà réservée par cet enfant
    if (isDateFull(date) && !isDateAlreadyReserved(date)) {
      console.log("Cette date est complète, impossible de la réserver:", format(date, 'yyyy-MM-dd'));
      return; // On bloque le toggle pour cette date
    }
    
    console.log("Date toggle clicked for:", format(date, 'yyyy-MM-dd'));
    handleDateToggle(date);
  };
  
  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription className={`text-[#ea384c] font-medium ${isBlinking ? 'animate-blink' : ''}`}>
          Veuillez sélectionner au moins 3 jours par semaine. Par défaut, l'option "Sans repas" est activée. Les adolescents sont accueillis à 11h30 (avec un pique-nique à apporter) ou à 13h30, selon le programme. Une "Carte jeune" d'une valeur de 5 euros par enfant est facturée pour l'année civile.
        </AlertDescription>
      </Alert>
      <ScrollArea className="h-[300px] pr-3">
        <div className="space-y-1">
          {periodDates.map(date => {
            if (!(date instanceof Date) || isNaN(date.getTime())) {
              console.error("Date invalide détectée dans periodDates:", date);
              return null;
            }
            
            const dateStr = format(new Date(date), 'yyyy-MM-dd');
            const selectedDate = selectedDatesMap.get(dateStr);
            const isSelected = !!selectedDate;
            const alreadyReserved = isDateAlreadyReserved(date);
            const isFull = isDateFull(date);
            
            // Si la date est complète et pas déjà réservée par cet enfant, elle n'est pas sélectionnable
            const isDisabled = isFull && !alreadyReserved;
            
            return (
              <div
                key={dateStr}
                className={`flex items-center justify-between px-2 py-1 hover:bg-gray-50 rounded ${isDisabled ? 'opacity-60' : ''}`}
              >
                <DateItem 
                  key={dateStr} 
                  date={date} 
                  isSelected={isSelected} 
                  isReserved={alreadyReserved} 
                  withoutMeal={selectedDate?.withoutMeal || false} 
                  earlyDropoff={selectedDate?.earlyDropoff || false} 
                  onDateToggle={() => onDateToggle(date)} 
                  onOptionChange={(option, value) => handleOptionChange(date, option, value)} 
                  isTeenClass={true} 
                  periodId={periodId} 
                  childSchoolClass={childInfo?.school_class || ''}
                  isDisabled={isDisabled}
                />
                <HolidaySpotsBadge
                  periodId={periodId}
                  date={dateStr}
                  childSchoolClass={childInfo?.school_class || ''}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};


import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateItem } from "./DateItem";
import { useHolidayPeriodContext } from "./HolidayPeriodContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
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
  const [isCM2InSummerPeriod, setIsCM2InSummerPeriod] = useState(false);
  
  // Effect to disable blinking after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBlinking(false);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, []);

  // Vérifier si l'enfant est CM2 et si nous sommes dans une période d'été spéciale
  useEffect(() => {
    const checkCM2SummerPeriod = async () => {
      if (!childInfo || !holidayPeriod || !periodId) return;
      
      if (childInfo.school_class === "CM2") {
        const { data } = await supabase
          .from("available_holiday_periods")
          .select("name")
          .eq("id", periodId)
          .single();
        
        if (data && ["ETE-01", "ETE-02", "ETE-03", "ETE-04"].includes(data.name)) {
          setIsCM2InSummerPeriod(true);
          console.log("CM2 en période d'été détecté, traité comme adolescent");
        } else {
          setIsCM2InSummerPeriod(false);
        }
      } else {
        setIsCM2InSummerPeriod(false);
      }
    };
    
    checkCM2SummerPeriod();
  }, [childInfo, holidayPeriod, periodId]);

  // Si ce n'est pas un adolescent ni un CM2 en période d'été spéciale, 
  // et si c'est la page des réservations normales, on ne devrait pas afficher ce composant
  const shouldDisplayTeenSelector = isTeenClass || isCM2InSummerPeriod;
  
  if (!shouldDisplayTeenSelector || !holidayPeriod) return null;

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

  console.log("TeenClassDateSelector - Period dates:", periodDates);
  console.log("TeenClassDateSelector - Selected dates:", selectedDates);
  console.log("TeenClassDateSelector - Child class:", childInfo?.school_class, "CM2 summer period:", isCM2InSummerPeriod);
  
  // Fonction pour vérifier explicitement si une date est sélectionnée
  const isDateSelected = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    const dateStr = format(new Date(date), 'yyyy-MM-dd');
    return selectedDatesMap.has(dateStr);
  };
  
  // Fonction pour gérer le click sur une date
  const onDateToggle = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Tentative de toggle sur une date invalide:", date);
      return;
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
            
            // Afficher toutes les dates disponibles pour l'enfant, qu'il soit classifié CM2 ou adolescent
            return (
              <DateItem 
                key={dateStr} 
                date={date} 
                isSelected={isSelected} 
                isReserved={isDateAlreadyReserved(date)} 
                withoutMeal={selectedDate?.withoutMeal || false} 
                earlyDropoff={selectedDate?.earlyDropoff || false} 
                onDateToggle={() => onDateToggle(date)} 
                onOptionChange={(option, value) => handleOptionChange(date, option, value)} 
                isTeenClass={true} 
                periodId={periodId} 
                childSchoolClass={childInfo?.school_class || ''}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChildSelectorProps {
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  children?: Tables<"children">[] | null;
  setSelectedDates?: (dates: any[]) => void;
  onCM2SummerPeriodCheck?: (isInSummerPeriod: boolean) => void;
}

export const ChildSelector = ({
  selectedChild,
  setSelectedChild,
  children,
  setSelectedDates,
  onCM2SummerPeriodCheck
}: ChildSelectorProps) => {
  const location = useLocation();
  const isHolidayReservation = location.pathname === "/holiday-reservations";
  const isTeenHolidayReservation = location.pathname === "/teenholiday-reservations";
  const isAdminTeenHolidayReservation = location.pathname === "/admin/reservations/new-teen-holiday";
  const isWednesdayReservation = location.pathname === "/wednesday-reservations";
  
  const { isTeenClassSync } = useSchoolClassUtils();
  const [showCM2Message, setShowCM2Message] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [summerPeriods] = useState<string[]>(["ETE-01", "ETE-02", "ETE-03", "ETE-04"]);

  // Requête pour obtenir les informations sur la période sélectionnée
  const { data: periodInfo } = useQuery({
    queryKey: ["holiday_period_info", selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return null;
      
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("name")
        .eq("id", selectedPeriodId)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération des informations de période:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!selectedPeriodId
  });

  // Récupérer les mappings de classe pour la période sélectionnée
  const { data: classMappings } = useQuery({
    queryKey: ["holiday_class_mappings", selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return [];
      
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("school_class, category")
        .eq("holiday_period_id", selectedPeriodId);
      
      if (error) {
        console.error("Erreur lors de la récupération des mappings de classe:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!selectedPeriodId
  });

  // Listen for period selection from URL search parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const periodId = searchParams.get("periodId");
    if (periodId) {
      setSelectedPeriodId(periodId);
    }
  }, [location.search]);

  // Effect to handle child change
  useEffect(() => {
    if (selectedChild && setSelectedDates) {
      // Reset dates when changing child
      setSelectedDates([]);
    }

    // Check if selected child is CM2 and on correct page
    const checkCM2TeenMapping = async () => {
      if (selectedChild) {
        const selectedChildData = children?.find(child => child.id === selectedChild);
        
        // Vérifier si c'est un CM2 et si on est sur une période d'été spécifique
        if (selectedChildData?.school_class === "CM2" && selectedPeriodId) {
          // Vérifier si c'est une période d'été spécifique
          if (periodInfo?.name && summerPeriods.includes(periodInfo.name)) {
            console.log(`CM2 sur période d'été spécifique: ${periodInfo.name}`);
            
            if (isHolidayReservation) {
              // Sur la page de réservation normale, afficher le message de redirection vers Club Ado
              setShowCM2Message(true);
            } else if ((isTeenHolidayReservation || isAdminTeenHolidayReservation)) {
              // Sur la page Club Ado, configurer pour permettre la réservation
              setShowCM2Message(false);
            }
            
            if (onCM2SummerPeriodCheck) {
              // Notifier que c'est une période d'été pour CM2
              onCM2SummerPeriodCheck(true);
            }
            return;
          }
          
          // Si ce n'est pas une période spécifique, utiliser la vérification normale
          try {
            const { isTeenClass } = await import("@/hooks/useSchoolClassUtils").then(module => module.useSchoolClassUtils());
            const isTeen = await isTeenClass(selectedChildData.school_class, selectedPeriodId);
            setShowCM2Message(isTeen && isHolidayReservation);
            if (onCM2SummerPeriodCheck) {
              onCM2SummerPeriodCheck(isTeen && (isTeenHolidayReservation || isAdminTeenHolidayReservation));
            }
          } catch (error) {
            console.error("Error checking teen class status:", error);
            setShowCM2Message(false);
            if (onCM2SummerPeriodCheck) {
              onCM2SummerPeriodCheck(false);
            }
          }
        } else {
          setShowCM2Message(false);
          if (onCM2SummerPeriodCheck) {
            onCM2SummerPeriodCheck(false);
          }
        }
      } else {
        setShowCM2Message(false);
        if (onCM2SummerPeriodCheck) {
          onCM2SummerPeriodCheck(false);
        }
      }
    };

    checkCM2TeenMapping();
  }, [selectedChild, setSelectedDates, children, isHolidayReservation, selectedPeriodId, periodInfo, onCM2SummerPeriodCheck, summerPeriods, isTeenHolidayReservation, isAdminTeenHolidayReservation]);
  
  // Pour la page des mercredis, utiliser les enfants tels quels
  // car ils sont déjà filtrés dans useChildrenData
  let filteredChildren = children;

  // Filtrage spécifique pour /holiday-reservations basé sur les mappings de classe
  if (isHolidayReservation && classMappings && classMappings.length > 0 && selectedPeriodId) {
    // Filtrer les enfants par catégorie primaire et maternelle selon les mappings
    filteredChildren = children?.filter(child => {
      // Chercher le mapping pour cette classe
      const mapping = classMappings.find(
        m => m.school_class.toLowerCase() === child.school_class.toLowerCase()
      );
      
      // Si un mapping existe, vérifier si la catégorie est maternelle ou primaire
      if (mapping) {
        return mapping.category === 'maternelle' || mapping.category === 'primaire';
      }
      
      // Si pas de mapping trouvé, utiliser la logique standard (exclure les adolescents)
      return !isTeenClassSync(child.school_class);
    });
  } else if (isHolidayReservation) {
    // Fallback à la logique standard si pas de mappings
    filteredChildren = children?.filter(child => {
      return !isTeenClassSync(child.school_class);
    });
  } else if (isTeenHolidayReservation || isAdminTeenHolidayReservation) {
    // Pour les réservations de vacances ados, afficher les adolescents et les CM2 pendant les périodes d'été
    filteredChildren = children?.filter(child => {
      const isChildTeen = isTeenClassSync(child.school_class);
      const isCM2 = child.school_class === "CM2";
      
      // Si c'est une période d'été spécifique, inclure également les CM2
      if (periodInfo?.name && summerPeriods.includes(periodInfo.name)) {
        return isChildTeen || isCM2;
      }
      return isChildTeen;
    });
  }

  console.log("Children passed to ChildSelector:", children);
  console.log("Filtered children based on page type:", filteredChildren);
  console.log("Current path:", location.pathname);
  console.log("isHolidayReservation:", isHolidayReservation);
  console.log("Selected period ID:", selectedPeriodId);
  console.log("Period info:", periodInfo);
  console.log("Class mappings:", classMappings);
  console.log("Is summer period:", periodInfo?.name && summerPeriods.includes(periodInfo.name));

  return (
    <div>
      <Label htmlFor="child-select">Sélectionner un enfant</Label>
      <select
        id="child-select"
        value={selectedChild}
        onChange={(e) => setSelectedChild(e.target.value)}
        className="w-full mt-2 rounded-md border border-gray-300 p-2"
      >
        <option value="">Choisir un enfant</option>
        {filteredChildren?.length ? (
          filteredChildren.map((child) => (
            <option 
              key={child.id} 
              value={child.id}
            >
              {child.last_name} {child.first_name} ({child.school_class})
            </option>
          ))
        ) : (
          <option value="" disabled>Aucun enfant éligible trouvé</option>
        )}
      </select>
      
      {showCM2Message && (
        <Alert className="mt-3 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm">
            <span className="font-bold text-red-500 animate-blink">
              Sur le mois de juillet, les enfants en CM2 seront accueilli avec les adolescents, vous pouvez faire votre réservation dans le menu "Club Ado"
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

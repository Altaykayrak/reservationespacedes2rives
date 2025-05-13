
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react"; // Ajout de useState

export const useChildFiltering = (
  children: Tables<"children">[] | null | undefined,
  selectedPeriodId: string
) => {
  const location = useLocation();
  const isHolidayReservation = location.pathname === "/holiday-reservations";
  const isTeenHolidayReservation = location.pathname === "/teenholiday-reservations";
  const isAdminTeenHolidayReservation = location.pathname === "/admin/reservations/new-teen-holiday";
  
  const { isTeenClassSync } = useSchoolClassUtils();
  const [summerPeriods] = useState<string[]>(["ETE-01", "ETE-02", "ETE-03", "ETE-04"]);
  const [isGlobalEventHandlerSet, setIsGlobalEventHandlerSet] = useState(false);

  // Prévenir les rechargements de page accidentels
  useEffect(() => {
    if (isGlobalEventHandlerSet) return;

    const preventFormSubmission = (e: SubmitEvent) => {
      console.log("[useChildFiltering] Interception d'une soumission de formulaire");
      if (!e.defaultPrevented) {
        e.preventDefault();
        e.stopPropagation();
      }
      return false;
    };
    
    const preventUnload = (e: BeforeUnloadEvent) => {
      if (location.pathname.includes('holiday-reservations') || 
          location.pathname.includes('teenholiday-reservations')) {
        console.log("[useChildFiltering] Tentative de quitter la page, prévention");
        e.preventDefault();
        return (e.returnValue = '');
      }
    };
    
    // Ajouter les écouteurs
    document.addEventListener('submit', preventFormSubmission, true);
    window.addEventListener('beforeunload', preventUnload);
    setIsGlobalEventHandlerSet(true);
    
    return () => {
      document.removeEventListener('submit', preventFormSubmission, true);
      window.removeEventListener('beforeunload', preventUnload);
    };
  }, [location.pathname, isGlobalEventHandlerSet]);

  // Requête pour obtenir les informations sur la période sélectionnée
  const { data: periodInfo } = useQuery({
    queryKey: ["holiday_period_info", selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return null;
      
      console.log("[useChildFiltering] Récupération des infos pour la période:", selectedPeriodId);
      
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("name")
        .eq("id", selectedPeriodId)
        .single();
      
      if (error) {
        console.error("[useChildFiltering] Erreur lors de la récupération des informations de période:", error);
        return null;
      }
      
      console.log("[useChildFiltering] Informations de période récupérées:", data);
      return data;
    },
    enabled: !!selectedPeriodId
  });

  // Récupérer les mappings de classe pour la période sélectionnée
  const { data: classMappings } = useQuery({
    queryKey: ["holiday_class_mappings", selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return [];
      
      console.log("[useChildFiltering] Récupération des mappings pour la période:", selectedPeriodId);
      
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("school_class, category")
        .eq("holiday_period_id", selectedPeriodId);
      
      if (error) {
        console.error("[useChildFiltering] Erreur lors de la récupération des mappings de classe:", error);
        return [];
      }
      
      console.log("[useChildFiltering] Mappings de classe récupérés:", data?.length);
      return data;
    },
    enabled: !!selectedPeriodId
  });

  // Filtrage des enfants basé sur la page et les mappings
  const getFilteredChildren = () => {
    console.log("[useChildFiltering] Current path:", location.pathname);
    console.log("[useChildFiltering] isHolidayReservation:", isHolidayReservation);
    console.log("[useChildFiltering] Selected period ID:", selectedPeriodId);
    console.log("[useChildFiltering] Period info:", periodInfo);
    console.log("[useChildFiltering] Class mappings:", classMappings);
    console.log("[useChildFiltering] Is summer period:", periodInfo?.name && summerPeriods.includes(periodInfo.name));
    
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

    return filteredChildren;
  };

  const isSummerPeriod = periodInfo?.name && summerPeriods.includes(periodInfo.name);

  return {
    filteredChildren: getFilteredChildren(),
    periodInfo,
    classMappings,
    isSummerPeriod,
    isHolidayReservation,
    isTeenHolidayReservation,
    isAdminTeenHolidayReservation
  };
};

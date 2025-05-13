
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";

export const useChildFiltering = (
  children: Tables<"children">[] | null | undefined,
  selectedPeriodId: string
) => {
  const location = useLocation();
  // Utiliser useMemo pour éviter les recalculs inutiles
  const isHolidayReservation = useMemo(() => location.pathname === "/holiday-reservations", [location.pathname]);
  const isTeenHolidayReservation = useMemo(() => location.pathname === "/teenholiday-reservations", [location.pathname]);
  const isAdminTeenHolidayReservation = useMemo(() => location.pathname === "/admin/reservations/new-teen-holiday", [location.pathname]);
  
  const { isTeenClassSync } = useSchoolClassUtils();
  // Utiliser useState pour les valeurs qui ne changent pas souvent
  const summerPeriods = ["ETE-01", "ETE-02", "ETE-03", "ETE-04"];

  // Console logs pour déboguer
  console.log("Current path:", location.pathname);
  console.log("isHolidayReservation:", isHolidayReservation);
  console.log("Selected period ID:", selectedPeriodId);

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

  console.log("Period info:", periodInfo);
  console.log("Class mappings:", classMappings);
  
  // Vérifier si nous sommes dans une période d'été
  const isSummerPeriod = useMemo(() => {
    return periodInfo?.name && summerPeriods.includes(periodInfo.name);
  }, [periodInfo, summerPeriods]);
  
  console.log("Is summer period:", isSummerPeriod);

  // Filtrage des enfants calculé une seule fois lorsque les dépendances changent
  const filteredChildren = useMemo(() => {
    // Pour la page des mercredis, utiliser les enfants tels quels
    // car ils sont déjà filtrés dans useChildrenData
    let result = children;

    // Filtrage spécifique pour /holiday-reservations basé sur les mappings de classe
    if (isHolidayReservation && classMappings && classMappings.length > 0 && selectedPeriodId) {
      // Filtrer les enfants par catégorie primaire et maternelle selon les mappings
      result = children?.filter(child => {
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
      result = children?.filter(child => {
        return !isTeenClassSync(child.school_class);
      });
    } else if (isTeenHolidayReservation || isAdminTeenHolidayReservation) {
      // Pour les réservations de vacances ados, afficher les adolescents et les CM2 pendant les périodes d'été
      result = children?.filter(child => {
        const isChildTeen = isTeenClassSync(child.school_class);
        const isCM2 = child.school_class === "CM2";
        
        // Si c'est une période d'été spécifique, inclure également les CM2
        if (periodInfo?.name && summerPeriods.includes(periodInfo.name)) {
          return isChildTeen || isCM2;
        }
        return isChildTeen;
      });
    }

    return result;
  }, [children, classMappings, selectedPeriodId, isHolidayReservation, isTeenHolidayReservation, isAdminTeenHolidayReservation, isTeenClassSync, periodInfo, summerPeriods]);

  return {
    filteredChildren,
    periodInfo,
    classMappings,
    isSummerPeriod,
    isHolidayReservation,
    isTeenHolidayReservation,
    isAdminTeenHolidayReservation
  };
};


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
  const isHolidayReservation = location.pathname === "/holiday-reservations";
  const isTeenHolidayReservation = location.pathname === "/teenholiday-reservations";
  const isAdminTeenHolidayReservation = location.pathname === "/admin/reservations/new-teen-holiday";
  
  const { isTeenClassSync } = useSchoolClassUtils();
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
    enabled: !!selectedPeriodId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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
    enabled: !!selectedPeriodId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Mémoriser les enfants filtrés pour éviter les recalculs inutiles
  const filteredChildren = useMemo(() => {
    // Pour un tableau d'enfants inexistant, retourner rapidement
    if (!children) return null;
    
    // Pour les réservations de vacances avec mappages de classes
    if (isHolidayReservation && classMappings && classMappings.length > 0 && selectedPeriodId) {
      return children.filter(child => {
        const mapping = classMappings.find(
          m => m.school_class.toLowerCase() === child.school_class.toLowerCase()
        );
        
        if (mapping) {
          return mapping.category === 'maternelle' || mapping.category === 'primaire';
        }
        
        return !isTeenClassSync(child.school_class);
      });
    } 
    // Pour les réservations de vacances sans mappages
    else if (isHolidayReservation) {
      return children.filter(child => !isTeenClassSync(child.school_class));
    } 
    // Pour les réservations de vacances pour adolescents
    else if (isTeenHolidayReservation || isAdminTeenHolidayReservation) {
      return children.filter(child => {
        const isChildTeen = isTeenClassSync(child.school_class);
        const isCM2 = child.school_class === "CM2";
        
        if (periodInfo?.name && summerPeriods.includes(periodInfo.name)) {
          return isChildTeen || isCM2;
        }
        return isChildTeen;
      });
    }
    
    // Par défaut : retourner tous les enfants
    return children;
  }, [children, classMappings, selectedPeriodId, periodInfo, isHolidayReservation, isTeenHolidayReservation, isAdminTeenHolidayReservation, isTeenClassSync, summerPeriods]);

  const isSummerPeriod = useMemo(() => {
    return periodInfo?.name && summerPeriods.includes(periodInfo.name);
  }, [periodInfo, summerPeriods]);

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

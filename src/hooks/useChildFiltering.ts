
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, useRef } from "react";

export const useChildFiltering = (
  children: Tables<"children">[] | null | undefined,
  selectedPeriodId: string
) => {
  const location = useLocation();
  const isHolidayReservation = location.pathname === "/holiday-reservations";
  const isTeenHolidayReservation = location.pathname === "/teenholiday-reservations";
  const isAdminTeenHolidayReservation = location.pathname === "/admin/reservations/new-teen-holiday";
  const pathRef = useRef(location.pathname);
  const processingRef = useRef(false);
  
  const { isTeenClassSync } = useSchoolClassUtils();
  const [summerPeriods] = useState<string[]>(["ETE-01", "ETE-02", "ETE-03", "ETE-04"]);

  // Requête pour obtenir les informations sur la période sélectionnée
  const { data: periodInfo, isError: periodError } = useQuery({
    queryKey: ["holiday_period_info", selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId || processingRef.current) return null;
      processingRef.current = true;
      console.log("[useChildFiltering] Fetching period info for:", selectedPeriodId);
      
      try {
        const { data, error } = await supabase
          .from("available_holiday_periods")
          .select("name")
          .eq("id", selectedPeriodId)
          .maybeSingle();
        
        if (error) {
          console.error("[useChildFiltering] Error fetching period info:", error);
          return null;
        }
        
        console.log("[useChildFiltering] Period info fetched:", data);
        return data;
      } catch (error) {
        console.error("[useChildFiltering] Unexpected error:", error);
        return null;
      } finally {
        // Désactiver le traitement après un délai
        setTimeout(() => {
          processingRef.current = false;
        }, 200);
      }
    },
    enabled: !!selectedPeriodId && !processingRef.current,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000,    // Garbage collection after 30 minutes
    retry: 3,                  // Retry 3 times on error
  });

  // Récupérer les mappings de classe pour la période sélectionnée
  const { data: classMappings, isError: mappingsError } = useQuery({
    queryKey: ["holiday_class_mappings", selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId || processingRef.current) return [];
      
      console.log("[useChildFiltering] Fetching class mappings for:", selectedPeriodId);
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("school_class, category")
        .eq("holiday_period_id", selectedPeriodId);
      
      if (error) {
        console.error("[useChildFiltering] Error fetching class mappings:", error);
        return [];
      }
      
      console.log("[useChildFiltering] Class mappings fetched:", data?.length || 0);
      return data || [];
    },
    enabled: !!selectedPeriodId && !processingRef.current,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000,    // Garbage collection after 30 minutes
    retry: 3,                  // Retry 3 times on error
  });

  // Utiliser une référence pour stocker le dernier résultat calculé
  const lastResultRef = useRef<{
    children: any;
    classMappings: any;
    result: any;
  }>({ children: null, classMappings: null, result: null });

  // Mémoriser les enfants filtrés pour éviter les recalculs inutiles
  const filteredChildren = useMemo(() => {
    // Vérifier si nous pouvons réutiliser le dernier résultat calculé
    if (lastResultRef.current.children === children &&
        lastResultRef.current.classMappings === classMappings) {
      return lastResultRef.current.result;
    }
    
    // Pour un tableau d'enfants inexistant, retourner rapidement
    if (!children) return null;
    
    // Enregistrer le chemin pour le débogage
    if (pathRef.current !== location.pathname) {
      console.log("[useChildFiltering] Path changed from", pathRef.current, "to", location.pathname);
      pathRef.current = location.pathname;
    }
    
    console.log("[useChildFiltering] Filtering children. Count:", children.length);
    
    // Effectuer une copie défensive des enfants pour éviter les mutations accidentelles
    const childrenCopy = [...children];
    
    // Pour les réservations de vacances avec mappages de classes
    let result;
    if (isHolidayReservation && classMappings && classMappings.length > 0 && selectedPeriodId) {
      result = childrenCopy.filter(child => {
        if (!child || !child.school_class) return false;
        
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
      result = childrenCopy.filter(child => {
        if (!child || !child.school_class) return false;
        return !isTeenClassSync(child.school_class);
      });
    } 
    // Pour les réservations de vacances pour adolescents
    else if (isTeenHolidayReservation || isAdminTeenHolidayReservation) {
      result = childrenCopy.filter(child => {
        if (!child || !child.school_class) return false;
        
        const isChildTeen = isTeenClassSync(child.school_class);
        const isCM2 = child.school_class === "CM2";
        
        if (periodInfo?.name && summerPeriods.includes(periodInfo.name)) {
          return isChildTeen || isCM2;
        }
        return isChildTeen;
      });
    } else {
      // Par défaut : retourner tous les enfants
      result = childrenCopy;
    }
    
    // Mettre à jour la référence pour les comparaisons futures
    lastResultRef.current = {
      children,
      classMappings,
      result
    };
    
    console.log("[useChildFiltering] Filtered children. Before:", children.length, "After:", result.length);
    return result;
  }, [children, classMappings, selectedPeriodId, periodInfo, isHolidayReservation, isTeenHolidayReservation, isAdminTeenHolidayReservation, isTeenClassSync, summerPeriods, location.pathname]);

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
    isAdminTeenHolidayReservation,
    hasErrors: periodError || mappingsError
  };
};


import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useNonTeenPeriodFiltering = (
  holidayPeriods: Tables<"available_holiday_periods">[] | null | undefined
) => {
  const [filteredPeriods, setFilteredPeriods] = useState<Tables<"available_holiday_periods">[] | null>(null);
  const periodsProcessed = useRef(false);

  // Récupérer les mappings de classes pour filtrer les périodes uniquement pour les non-adolescents
  const { data: classMappings } = useQuery({
    queryKey: ["class_mappings_non_teen"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("holiday_period_id, category")
        .neq("category", "adolescent");
      
      if (error) {
        console.error("Error fetching non-teen class mappings:", error);
        throw error;
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Garbage collection after 10 minutes
  });

  // Fonction de tri pour les périodes de vacances
  const sortHolidayPeriods = (periods: Tables<"available_holiday_periods">[]) => {
    return [...periods].sort((a, b) => {
      // Extraire les préfixes ETE-XX
      const aMatch = a.name?.match(/^(ETE)-(\d+)$/);
      const bMatch = b.name?.match(/^(ETE)-(\d+)$/);
      
      // Si les deux périodes sont des périodes d'été
      if (aMatch && bMatch) {
        // Comparer les numéros de périodes d'été
        return parseInt(aMatch[2]) - parseInt(bMatch[2]);
      }
      
      // Si seulement a est une période d'été, la mettre en premier
      if (aMatch) return -1;
      
      // Si seulement b est une période d'été, la mettre en premier
      if (bMatch) return 1;
      
      // Pour les autres périodes, conserver l'ordre chronologique
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
  };

  // Filtrer les périodes spécifiques aux enfants non-adolescents
  useEffect(() => {
    if (holidayPeriods && classMappings && !periodsProcessed.current) {
      console.log("[useNonTeenPeriodFiltering] Filtering periods for non-teen children");
      
      // Extraire les IDs de période qui ont des classes mappées comme non-adolescents
      const nonTeenPeriodIds = Array.from(
        new Set(
          classMappings
            .filter(mapping => mapping.category !== "adolescent")
            .map(mapping => mapping.holiday_period_id)
        )
      );
      
      // Si nous avons des mappings spécifiques, filtrons les périodes
      if (nonTeenPeriodIds.length > 0) {
        const nonTeenPeriods = holidayPeriods.filter(
          period => nonTeenPeriodIds.includes(period.id)
        );
        setFilteredPeriods(sortHolidayPeriods(nonTeenPeriods));
      } else {
        // Sinon, afficher toutes les périodes par défaut
        setFilteredPeriods(sortHolidayPeriods(holidayPeriods));
      }
      
      periodsProcessed.current = true;
    } else if (holidayPeriods && !periodsProcessed.current) {
      // Si nous n'avons pas de mappings, utiliser toutes les périodes
      setFilteredPeriods(sortHolidayPeriods(holidayPeriods));
      periodsProcessed.current = true;
    }
  }, [holidayPeriods, classMappings]);

  // Réinitialiser le drapeau si les périodes ou mappings changent
  useEffect(() => {
    if (holidayPeriods || classMappings) {
      periodsProcessed.current = false;
    }
  }, [holidayPeriods, classMappings]);

  return { filteredPeriods };
};

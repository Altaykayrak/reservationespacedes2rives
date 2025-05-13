
import { getGroupNameForPeriod } from "@/utils/schoolClassUtils";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSchoolClassUtils = () => {
  const [cache, setCache] = useState<Record<string, boolean>>({});

  const isTeenClass = useCallback(async (schoolClass: string, periodId?: string): Promise<boolean> => {
    // Créer une clé de cache unique pour cette combinaison classe/période
    const cacheKey = `${schoolClass}-${periodId || 'default'}`;
    
    // Vérifier si le résultat est déjà en cache
    if (cache[cacheKey] !== undefined) {
      return cache[cacheKey];
    }
    
    try {
      // Si une période est spécifiée, vérifier s'il existe un mapping spécifique
      if (periodId) {
        const { data: mapping, error } = await supabase
          .from("holiday_period_class_mappings")
          .select("category")
          .eq("holiday_period_id", periodId)
          .eq("school_class", schoolClass)
          .maybeSingle();
        
        if (error) throw error;
        
        // Si un mapping existe pour cette période
        if (mapping) {
          const isTeenResult = mapping.category === "adolescent";
          // Mettre en cache le résultat
          setCache(prev => ({ ...prev, [cacheKey]: isTeenResult }));
          return isTeenResult;
        }
      }
      
      // Si aucun mapping n'a été trouvé ou aucune période n'a été spécifiée,
      // utiliser la vérification par défaut
      const group = await getGroupNameForPeriod(schoolClass, periodId);
      const isTeenResult = group === "adolescent";
      
      // Mettre en cache le résultat
      setCache(prev => ({ ...prev, [cacheKey]: isTeenResult }));
      return isTeenResult;
    } catch (error) {
      console.error("Error in isTeenClass:", error);
      return false;
    }
  }, [cache]);

  // Version synchrone pour les cas où async n'est pas pratique
  const isTeenClassSync = (schoolClass: string, periodId?: string): boolean => {
    // Pour la version synchrone, nous utilisons uniquement les règles standards
    // sans vérification des mappings spécifiques
    const normalizedClass = schoolClass.toUpperCase();
    
    // Liste des classes d'adolescents
    const teenClasses = [
      "6EME", "6ÈME", "5EME", "5ÈME", "4EME", "4ÈME", "3EME", "3ÈME",
      "SECONDE", "PREMIÈRE", "PREMIERE", "TERMINALE", "CAP"
    ];
    
    return teenClasses.includes(normalizedClass);
  };
  
  return { isTeenClass, isTeenClassSync };
};


import { normalizeSchoolClass, getGroupName } from "@/utils/schoolClassUtils";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolClassCategories } from "./useSchoolClassCategories";

export const useSchoolClassUtils = () => {
  const { isTeenClass: isTeenClassFromCategories } = useSchoolClassCategories();
  
  const isTeenClass = async (schoolClass: string, holidayPeriodId?: string) => {
    const normalizedClass = normalizeSchoolClass(schoolClass);
    
    // Si un ID de période est fourni, vérifier le mapping spécifique
    if (holidayPeriodId) {
      try {
        // Vérifier d'abord s'il existe un mapping spécifique
        const { data: specificMapping } = await supabase
          .from("holiday_period_class_mappings")
          .select("category")
          .eq("holiday_period_id", holidayPeriodId)
          .eq("school_class", normalizedClass)
          .single();
        
        if (specificMapping) {
          // Si la catégorie est "aucune", cette classe n'est pas accessible
          if (specificMapping.category === "aucune") {
            return false;
          }
          return specificMapping.category === 'adolescent';
        }
        
        // Vérifier si c'est une période spécifique d'été
        const { data: periodInfo } = await supabase
          .from("available_holiday_periods")
          .select("name")
          .eq("id", holidayPeriodId)
          .single();
        
        if (periodInfo && normalizedClass === "CM2" && 
            (periodInfo.name === "ETE-01" || 
             periodInfo.name === "ETE-02" || 
             periodInfo.name === "ETE-03" || 
             periodInfo.name === "ETE-04")) {
          return true;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du mapping spécifique:", error);
      }
    }
    
    // Si pas de mapping spécifique ou erreur, utiliser la catégorisation par défaut
    return isTeenClassFromCategories(normalizedClass);
  };

  // Version synchrone pour compatibilité avec le code existant
  const isTeenClassSync = (schoolClass: string) => {
    return isTeenClassFromCategories(schoolClass);
  };

  return { isTeenClass, isTeenClassSync };
};

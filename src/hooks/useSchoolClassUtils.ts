
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

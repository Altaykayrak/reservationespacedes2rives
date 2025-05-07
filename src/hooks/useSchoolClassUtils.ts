
import { normalizeSchoolClass, getGroupName } from "@/utils/schoolClassUtils";
import { supabase } from "@/integrations/supabase/client";

export const useSchoolClassUtils = () => {
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
          return specificMapping.category === 'adolescent';
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du mapping spécifique:", error);
      }
    }
    
    // Si pas de mapping spécifique ou erreur, utiliser la catégorisation par défaut
    const group = getGroupName(normalizedClass);
    return group === 'adolescent';
  };

  // Version synchrone pour compatibilité avec le code existant
  const isTeenClassSync = (schoolClass: string) => {
    const normalizedClass = normalizeSchoolClass(schoolClass);
    const group = getGroupName(normalizedClass);
    return group === 'adolescent';
  };

  return { isTeenClass, isTeenClassSync };
};

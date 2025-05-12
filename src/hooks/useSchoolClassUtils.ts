
import { normalizeSchoolClass, getGroupName } from "@/utils/schoolClassUtils";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolClassCategories } from "./useSchoolClassCategories";
import { useQuery } from "@tanstack/react-query";

export const useSchoolClassUtils = () => {
  const { isTeenClass: isTeenClassFromCategories } = useSchoolClassCategories();
  
  // Utiliser useQuery pour récupérer les périodes d'été
  const { data: summerPeriods } = useQuery({
    queryKey: ["summer_periods"],
    queryFn: async () => {
      const { data } = await supabase
        .from("available_holiday_periods")
        .select("id, name")
        .in("name", ["ETE-01", "ETE-02", "ETE-03", "ETE-04"]);
        
      return data || [];
    }
  });
  
  const isTeenClass = async (schoolClass: string, holidayPeriodId?: string) => {
    const normalizedClass = normalizeSchoolClass(schoolClass);
    
    // Si un ID de période est fourni, vérifier le mapping spécifique
    if (holidayPeriodId) {
      try {
        // Vérifier d'abord les périodes d'été spéciales pour CM2
        if (normalizedClass === "CM2") {
          const { data: periodInfo } = await supabase
            .from("available_holiday_periods")
            .select("name")
            .eq("id", holidayPeriodId)
            .single();
          
          if (periodInfo && ["ETE-01", "ETE-02", "ETE-03", "ETE-04"].includes(periodInfo.name)) {
            console.log(`CM2 est considéré comme adolescent pour la période d'été: ${periodInfo.name}`);
            return true;
          }
        }
        
        // Vérifier ensuite s'il existe un mapping spécifique
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
    // Si c'est un CM2, vérifier si des périodes d'été sont actives
    if (schoolClass === "CM2" && summerPeriods?.length) {
      // Pour l'affichage dans les listes, on considère CM2 comme ado si des périodes d'été sont disponibles
      console.log("Le CM2 peut être affiché comme ado car des périodes d'été sont disponibles");
      return true;
    }
    
    return isTeenClassFromCategories(schoolClass);
  };

  return { isTeenClass, isTeenClassSync };
};

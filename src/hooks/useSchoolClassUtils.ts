
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
      try {
        const { data, error } = await supabase
          .from("available_holiday_periods")
          .select("id, name")
          .in("name", ["ETE-01", "ETE-02", "ETE-03", "ETE-04"]);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des périodes d'été:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const isTeenClass = async (schoolClass: string, holidayPeriodId?: string) => {
    if (!schoolClass) return false;
    
    const normalizedClass = normalizeSchoolClass(schoolClass);
    
    // Traitement spécial pour CM2 durant les périodes d'été
    if (normalizedClass === "CM2" && holidayPeriodId) {
      try {
        // Vérifier si c'est une période d'été (ETE-01 à ETE-04)
        const { data: periodInfo } = await supabase
          .from("available_holiday_periods")
          .select("name")
          .eq("id", holidayPeriodId)
          .single();
        
        if (periodInfo && ["ETE-01", "ETE-02", "ETE-03", "ETE-04"].includes(periodInfo.name)) {
          console.log(`CM2 est considéré comme adolescent pour la période d'été: ${periodInfo.name}`);
          return true;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la période:", error);
      }
    }
    
    // Si ce n'est pas un CM2 en période d'été, vérifier le mapping spécifique
    if (holidayPeriodId) {
      try {
        const { data: mappings } = await supabase
          .from("holiday_period_class_mappings")
          .select("category, school_class, holiday_period_id");
          
        const specificMapping = mappings?.find(m => 
          m.holiday_period_id === holidayPeriodId && 
          m.school_class.toUpperCase() === normalizedClass.toUpperCase()
        );
        
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
  const isTeenClassSync = (schoolClass: string, periodId?: string) => {
    if (!schoolClass) return false;
    
    // Si c'est un CM2 et qu'on a un ID de période
    if (schoolClass === "CM2" && periodId && summerPeriods) {
      // Vérifier si la période est dans notre liste de périodes d'été
      const isSummerPeriod = summerPeriods.some(p => p.id === periodId && ["ETE-01", "ETE-02", "ETE-03", "ETE-04"].includes(p.name));
      
      if (isSummerPeriod) {
        console.log("CM2 sur période d'été spécifique:", summerPeriods.find(p => p.id === periodId)?.name);
        return true;
      }
    }
    
    // Si c'est un CM2, vérifier si des périodes d'été sont actives (pour l'affichage dans les listes)
    if (schoolClass === "CM2" && summerPeriods?.length) {
      console.log("Le CM2 peut être affiché comme ado car des périodes d'été sont disponibles");
      return true;
    }
    
    return isTeenClassFromCategories(schoolClass);
  };

  return { isTeenClass, isTeenClassSync };
};

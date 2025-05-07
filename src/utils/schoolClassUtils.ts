
import { supabase } from "@/integrations/supabase/client";

export const normalizeSchoolClass = (schoolClass: string): string => {
  const classMap: { [key: string]: string } = {
    "PETITE SECTION": "PS",
    "MOYENNE SECTION": "MS",
    "GRANDE SECTION": "GS",
    "6EME": "6ème",
    "5EME": "5ème",
    "4EME": "4ème",
    "3EME": "3ème",
    "SECONDE": "Seconde",
    "PREMIERE": "Première",
    "TERMINALE": "Terminale"
  };

  const normalizedClass = schoolClass.trim().toUpperCase();
  return classMap[normalizedClass] || schoolClass.trim();
};

export const getGroupName = (schoolClass: string) => {
  const normalizedClass = normalizeSchoolClass(schoolClass);
  if (["PS", "MS", "GS"].includes(normalizedClass)) 
    return 'maternelle';
  if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(normalizedClass)) 
    return 'primaire';
  if (["6ème", "5ème", "4ème", "3ème", "Seconde", "Première", "Terminale"].includes(normalizedClass))
    return 'adolescent';
  return 'adolescent';
};

// Fonction asynchrone pour vérifier la catégorie en tenant compte des mappings spécifiques
export const getGroupNameForPeriod = async (schoolClass: string, periodId?: string) => {
  if (!periodId) return getGroupName(schoolClass);

  try {
    const normalizedClass = normalizeSchoolClass(schoolClass);
    
    // Vérifier s'il existe un mapping spécifique
    const { data: mapping, error } = await supabase
      .from("holiday_period_class_mappings")
      .select("category")
      .eq("holiday_period_id", periodId)
      .eq("school_class", normalizedClass)
      .maybeSingle();

    if (mapping) {
      return mapping.category;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du groupe pour la période:", error);
  }

  // Retourner la valeur par défaut si pas de mapping ou erreur
  return getGroupName(schoolClass);
};

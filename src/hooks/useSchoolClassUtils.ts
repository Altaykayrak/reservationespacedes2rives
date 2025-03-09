
import { useSchoolClassCategories } from "./useSchoolClassCategories";

export const useSchoolClassUtils = () => {
  const { schoolClassCategories } = useSchoolClassCategories();

  const isTeenClass = (schoolClass: string) => {
    if (!schoolClass) return false;
    
    const normalizedClass = schoolClass.trim().toUpperCase();
    
    // Liste directe des classes adolescentes connues
    const knownTeenClasses = ["6EME", "5EME", "4EME", "3EME", "SECONDE", "PREMIERE", "TERMINALE", 
                               "6ÈME", "5ÈME", "4ÈME", "3ÈME", "PREMIÈRE"];
    
    if (knownTeenClasses.includes(normalizedClass)) {
      return true;
    }
    
    // Vérification via les catégories de la base de données
    return schoolClassCategories?.some(
      category => 
        category.category === "adolescent" && 
        normalizedClass === category.name.toUpperCase()
    ) || false;
  };

  return { isTeenClass };
};

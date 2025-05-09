
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolClassUtils } from "./useSchoolClassUtils";
import { useSchoolClassCategories } from "./useSchoolClassCategories";

export const useChildrenData = () => {
  const { data: children, isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // S'assurer que l'utilisateur est connecté et récupérer ses enfants
      if (!session?.user?.id) {
        console.log("Pas de session utilisateur trouvée");
        return [];
      }
      
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq('profile_id', session.user.id)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true });
      
      if (error) {
        console.error("Erreur lors de la récupération des enfants:", error);
        throw error;
      }
      
      console.log("Enfants récupérés:", data);
      return data;
    },
  });

  const { isTeenClassSync } = useSchoolClassUtils();
  const { schoolClassCategories } = useSchoolClassCategories();

  // Filtre pour les adolescents
  const teenChildren = children?.filter(child => isTeenClassSync(child.school_class)) || [];
  
  // Filtre pour les non-adolescents
  const nonTeenChildren = children?.filter(child => !isTeenClassSync(child.school_class)) || [];
  
  // Filtre pour les enfants éligibles aux mercredis (exclure PS et adolescents)
  // Utiliser directement les catégories pour déterminer si c'est un adolescent
  const wednesdayEligibleChildren = children?.filter(child => {
    // Exclure les PS directement
    const isPS = child.school_class.toUpperCase() === "PS";
    
    // Vérifier si c'est un adolescent en utilisant les catégories
    const isTeen = schoolClassCategories?.some(
      category => 
        category.category === "adolescent" && 
        child.school_class.toUpperCase() === category.name.toUpperCase()
    );
    
    console.log(`Enfant ${child.first_name} ${child.last_name}, classe: ${child.school_class}, est PS: ${isPS}, est adolescent: ${isTeen}`);
    
    // Inclure uniquement si ce n'est ni PS ni adolescent
    return !isPS && !isTeen;
  }) || [];

  console.log("Enfants éligibles pour le mercredi:", wednesdayEligibleChildren);

  return { 
    children,
    isLoading,
    teenChildren,
    nonTeenChildren,
    wednesdayEligibleChildren
  };
};

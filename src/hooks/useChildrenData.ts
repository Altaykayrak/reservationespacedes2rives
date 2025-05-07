
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolClassUtils } from "./useSchoolClassUtils";

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

  const { isTeenClass } = useSchoolClassUtils();

  const teenChildren = children?.filter(child => isTeenClass(child.school_class)) || [];
  const nonTeenChildren = children?.filter(child => !isTeenClass(child.school_class)) || [];
  
  // Filtre pour exclure les PS et les adolescents
  const wednesdayEligibleChildren = children?.filter(child => {
    const isPS = child.school_class.toUpperCase() === "PS";
    const isTeen = isTeenClass(child.school_class);
    return !isPS && !isTeen;
  }) || [];

  return { 
    children,
    isLoading,
    teenChildren,
    nonTeenChildren,
    wednesdayEligibleChildren
  };
};

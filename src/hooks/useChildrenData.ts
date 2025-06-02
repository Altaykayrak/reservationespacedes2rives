
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useChildrenData = () => {
  const { data: children, isLoading } = useQuery({
    queryKey: ["admin_all_children"],
    queryFn: async () => {
      // Récupérer tous les enfants de tous les utilisateurs avec les informations du parent
      const { data, error } = await supabase
        .from("children")
        .select(`
          *,
          profile:profiles!children_profile_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true });
      
      if (error) {
        console.error("Erreur lors de la récupération des enfants:", error);
        throw error;
      }
      
      console.log("Tous les enfants récupérés:", data);
      return data;
    },
  });

  // Filtre pour les enfants éligibles aux mercredis (exclure PS et adolescents)
  const wednesdayEligibleChildren = children?.filter(child => {
    // Exclure les PS directement
    const isPS = child.school_class.toUpperCase() === "PS";
    
    // Exclure les adolescents (6ème et plus)
    const isAdolescent = ['6EME', '6ÈME', '5EME', '5ÈME', '4EME', '4ÈME', '3EME', '3ÈME', 
                         'SECONDE', 'PREMIERE', 'PREMIÈRE', 'TERMINALE'].includes(child.school_class.toUpperCase());
    
    console.log(`Enfant ${child.first_name} ${child.last_name}, classe: ${child.school_class}, est PS: ${isPS}, est adolescent: ${isAdolescent}`);
    
    // Inclure uniquement si ce n'est ni PS ni adolescent
    return !isPS && !isAdolescent;
  }) || [];

  console.log("Enfants éligibles pour le mercredi:", wednesdayEligibleChildren);

  return { 
    children,
    isLoading,
    wednesdayEligibleChildren
  };
};

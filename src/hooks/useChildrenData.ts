
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

  return { children, isLoading };
};

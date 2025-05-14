
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  return useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log("useAdminAuth: Aucune session active");
        return { isAdmin: false, isLoading: false };
      }
      
      console.log("useAdminAuth: Vérification du statut admin pour l'utilisateur:", session.user.id);
      const { data: isAdmin, error } = await supabase
        .rpc('is_admin', { user_id: session.user.id });
      
      if (error) {
        console.error("Erreur lors de la vérification du statut admin:", error);
        return { isAdmin: false, isError: true };
      }
      
      console.log("useAdminAuth: Résultat de la vérification admin:", isAdmin);
      return { isAdmin: !!isAdmin, isLoading: false };
    },
    retry: 1, // Un seul essai en cas d'échec
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

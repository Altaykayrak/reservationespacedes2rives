
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useAdminAuth = () => {
  const { user, loading } = useAuth();
  
  const {
    data: isAdmin = false,
    isLoading,
    isError,
    isFetching
  } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        console.log("[useAdminAuth] Vérification des droits admin pour:", user.id);
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (error) {
          console.error("[useAdminAuth] Erreur lors de la vérification admin:", error);
          throw error;
        }
        
        console.log("[useAdminAuth] Résultat vérification admin:", data);
        return !!data;
      } catch (err) {
        console.error("[useAdminAuth] Erreur complète:", err);
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  // Déterminer si la vérification est toujours en cours
  const isChecking = loading || (!loading && !!user && (isLoading || isFetching));
  
  return {
    data: isAdmin,
    isLoading,
    isError,
    isChecking
  };
};

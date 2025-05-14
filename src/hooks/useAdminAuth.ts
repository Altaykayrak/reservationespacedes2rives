
import { useState, useEffect } from "react";
import { supabase, checkSession } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export const useAdminAuth = () => {
  const { user, initialized, loading: authLoading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  const {
    data: isAdmin,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["isAdmin", user?.id],
    enabled: !!user?.id && initialized && isAuthenticated,
    queryFn: async () => {
      console.log("[useAdminAuth] Vérification du statut admin pour l'utilisateur:", user?.id);
      
      try {
        // Vérifier d'abord que la session est toujours valide
        const session = await checkSession();
        if (!session) {
          console.error("[useAdminAuth] Session invalide lors de la vérification du statut admin");
          return false;
        }
        
        const { data, error } = await supabase.rpc("is_admin", { user_id: user?.id });
        
        if (error) {
          console.error("[useAdminAuth] Erreur lors de la vérification du statut admin:", error);
          throw error;
        }
        
        console.log("[useAdminAuth] Statut admin:", data ? "ADMIN" : "NON ADMIN");
        return !!data;
      } catch (error) {
        console.error("[useAdminAuth] Erreur inattendue lors de la vérification:", error);
        throw error;
      }
    },
    retry: 2,
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (!authLoading && initialized) {
      if (!user || !isAuthenticated) {
        console.log("[useAdminAuth] Utilisateur non authentifié");
        setIsChecking(false);
      } else if (!isLoading) {
        console.log("[useAdminAuth] Vérification terminée");
        setIsChecking(false);
      }
    }
  }, [user, initialized, authLoading, isLoading, isAuthenticated]);

  return {
    data: isAdmin,
    isError: !!error,
    isLoading,
    isChecking,
    refetch
  };
};
